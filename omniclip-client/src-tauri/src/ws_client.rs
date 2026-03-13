use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};

use crate::crypto::{decrypt, encrypt};

#[derive(Serialize, Deserialize, Debug)]
pub struct ClipboardPayload {
    pub device_id: String,
    pub encrypted_payload: String,
}

pub async fn start_ws_client(
    app: AppHandle,
    token: String,
    device_id: String,
    mut rx: mpsc::Receiver<String>,
) {
    let url = format!("ws://127.0.0.1:3000/ws?token={}", token); // Hardcoded for local dev

    let (ws_stream, _) = match connect_async(&url).await {
        Ok(v) => v,
        Err(e) => {
            eprintln!("Failed to connect to relay: {}", e);
            return;
        }
    };

    let (mut write, mut read) = ws_stream.split();
    let app_clone = app.clone();
    let last_received = Arc::new(Mutex::new(String::new()));

    // Receiver Task
    let lr_read = last_received.clone();
    let device_id_read = device_id.clone();
    let read_task = tauri::async_runtime::spawn(async move {
        while let Some(Ok(Message::Text(text))) = read.next().await {
            if let Ok(payload) = serde_json::from_str::<ClipboardPayload>(&text) {
                // Ignore messages from ourselves
                if payload.device_id == device_id_read {
                    continue;
                }

                if let Some(decrypted) = decrypt(&payload.encrypted_payload) {
                    *lr_read.lock().await = decrypted.clone();
                    let _ = app_clone.clipboard().write_text(decrypted);
                }
            }
        }
    });

    // Sender Task
    let lr_write = last_received.clone();
    let write_task = tauri::async_runtime::spawn(async move {
        while let Some(new_clip) = rx.recv().await {
            // Check if this matched what we just received (stop infinite loops)
            if *lr_write.lock().await == new_clip {
                continue;
            }

            let payload = ClipboardPayload {
                device_id: device_id.clone(),
                encrypted_payload: encrypt(&new_clip),
            };

            if let Ok(json) = serde_json::to_string(&payload) {
                let _ = write.send(Message::Text(json)).await;
            }
        }
    });

    tokio::select! {
        _ = read_task => {},
        _ = write_task => {},
    }
}
