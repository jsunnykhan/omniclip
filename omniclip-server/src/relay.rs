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
    pub device_id: Option<String>,
    pub device_name: Option<String>,
    pub os: Option<String>,
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

    // Check device limits
    let req_device_id = auth.device_id.unwrap_or_else(|| Uuid::new_v4().to_string());
    let req_name = auth.device_name.unwrap_or_else(|| "Unknown".to_string());
    let req_os = auth.os.unwrap_or_else(|| "Unknown".to_string());

    let user_info = sqlx::query!("SELECT max_allowed_devices FROM users WHERE id = $1", user_id)
        .fetch_optional(&state.app.db).await
        .unwrap_or(None);

    let max_devices = user_info.map(|u| u.max_allowed_devices).unwrap_or(2);

    let device_count = sqlx::query!("SELECT COUNT(*) FROM devices WHERE user_id = $1", user_id)
        .fetch_one(&state.app.db).await
        .unwrap().count.unwrap_or(0);

    let is_registered = sqlx::query!("SELECT 1 as registered FROM devices WHERE user_id = $1 AND device_id = $2", user_id, req_device_id)
        .fetch_optional(&state.app.db).await
        .unwrap().is_some();

    if !is_registered && device_count >= max_devices as i64 {
        return (
            axum::http::StatusCode::FORBIDDEN,
            "Device limit reached. Upgrade your plan or apply a promo code."
        ).into_response();
    }

    // Upsert device to bump last_sync
    let _ = sqlx::query!(
        "INSERT INTO devices (user_id, device_id, name, os, last_sync) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (user_id, device_id) DO UPDATE SET last_sync = NOW()",
        user_id, req_device_id, req_name, req_os
    ).execute(&state.app.db).await;

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
