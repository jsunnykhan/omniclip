use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures::{sink::SinkExt, stream::StreamExt};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;
use std::collections::HashMap;

use crate::auth::{AppState, Claims};

#[derive(Deserialize)]
pub struct WsAuth {
    pub token: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClipboardPayload {
    pub device_id: String,
    pub encrypted_payload: String,
}

#[derive(Clone)]
pub struct RelayState {
    pub app: Arc<AppState>,
    pub channels: Arc<RwLock<HashMap<Uuid, broadcast::Sender<String>>>>,
}

pub fn relay_routes(state: RelayState) -> Router {
    Router::new()
        .route("/ws", get(ws_handler))
        .with_state(state)
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(auth): Query<WsAuth>,
    State(state): State<RelayState>,
) -> impl IntoResponse {
    // Validate Token
    let token_data = match decode::<Claims>(
        &auth.token,
        &DecodingKey::from_secret(state.app.jwt_secret.as_bytes()),
        &Validation::default(),
    ) {
        Ok(c) => c.claims,
        Err(_) => return axum::http::StatusCode::UNAUTHORIZED.into_response(),
    };

    let user_id = token_data.sub.clone();
    let plan = token_data.plan_type.clone();

    ws.on_upgrade(move |socket| handle_socket(socket, state, user_id, plan))
}

async fn handle_socket(mut socket: WebSocket, state: RelayState, user_id: Uuid, plan: String) {
    let tx = {
        let mut channels = state.channels.write().await;
        channels
            .entry(user_id)
            .or_insert_with(|| broadcast::channel(100).0)
            .clone()
    };

    let mut rx = tx.subscribe();

    // Send latest items to newly connected client
    let history_limit = if plan == "free" { 1 } else { 100 };
    if let Ok(records) = sqlx::query!(
        "SELECT device_id, encrypted_payload FROM clipboard_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
        user_id,
        history_limit as i64
    )
    .fetch_all(&state.app.db)
    .await {
        for record in records.iter().rev() {
            let msg = ClipboardPayload {
                device_id: record.device_id.clone().unwrap_or_default(),
                encrypted_payload: record.encrypted_payload.clone(),
            };
            if let Ok(json) = serde_json::to_string(&msg) {
                let _ = socket.send(Message::Text(json)).await;
            }
        }
    }

    let (mut sender, mut receiver) = socket.split();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let db_pool = state.app.db.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            if let Ok(payload) = serde_json::from_str::<ClipboardPayload>(&text) {
                // Enforce Plan Guard
                if plan == "free" {
                    let _ = sqlx::query!("DELETE FROM clipboard_items WHERE user_id = $1", user_id)
                        .execute(&db_pool)
                        .await;
                }

                // Store incoming
                let _ = sqlx::query!(
                    "INSERT INTO clipboard_items (user_id, device_id, encrypted_payload) VALUES ($1, $2, $3)",
                    user_id,
                    payload.device_id,
                    payload.encrypted_payload
                )
                .execute(&db_pool)
                .await;

                // Broadcast
                let _ = tx.send(text);
            }
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
