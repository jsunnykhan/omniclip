use axum::{extract::Json, routing::post, Router};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct ClientLogPayload {
    pub level: String,
    pub message: String,
    pub device_id: String,
}

use std::sync::Arc;
use crate::auth::AppState;

pub fn logs_routes() -> Router<Arc<AppState>> {
    Router::new().route("/", post(receive_client_log))
}

async fn receive_client_log(Json(payload): Json<ClientLogPayload>) {
    let level = payload.level.to_lowercase();
    match level.as_str() {
        "error" => tracing::error!("Client [{}] Error: {}", payload.device_id, payload.message),
        "warn" => tracing::warn!("Client [{}] Warn: {}", payload.device_id, payload.message),
        "info" => tracing::info!("Client [{}] Info: {}", payload.device_id, payload.message),
        "debug" => tracing::debug!("Client [{}] Debug: {}", payload.device_id, payload.message),
        "trace" => tracing::trace!("Client [{}] Trace: {}", payload.device_id, payload.message),
        _ => tracing::info!("Client [{}] ({}): {}", payload.device_id, payload.level, payload.message),
    }
}
