// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod crypto;
mod watcher;
mod ws_client;

#[cfg(test)]
mod tests;


use tauri_plugin_autostart::MacosLauncher;
use tokio::sync::{mpsc, Mutex};
use tauri::{Manager, Emitter};

pub struct AppState {
    pub receiver: Mutex<Option<mpsc::Receiver<String>>>,
}

#[tauri::command]
async fn start_sync(
    token: String,
    device_id: String,
    device_name: String,
    os: String,
    state: tauri::State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut rx_guard = state.receiver.lock().await;
    if let Some(rx) = rx_guard.take() {
        tauri::async_runtime::spawn(async move {
            crate::ws_client::start_ws_client(app_handle, token, device_id, device_name, os, rx).await;
        });
        Ok(())
    } else {
        Ok(())
    }
}

#[tauri::command]
async fn check_for_update(app_handle: tauri::AppHandle) -> Result<serde_json::Value, String> {
    use tauri_plugin_updater::UpdaterExt;

    let updater = app_handle.updater().map_err(|e| e.to_string())?;
    match updater.check().await.map_err(|e| e.to_string())? {
        Some(update) => {
            let version = update.version.clone();
            let body = update.body.clone().unwrap_or_default();
            // Download and install the update
            update.download_and_install(|_chunk, _total| {}, || {}).await.map_err(|e| e.to_string())?;
            Ok(serde_json::json!({
                "available": true,
                "version": version,
                "notes": body
            }))
        }
        None => Ok(serde_json::json!({ "available": false })),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--silently"])))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![start_sync, check_for_update])
        .setup(|app| {
            let handle = app.handle();
            let (tx, rx) = mpsc::channel(100);

            app.manage(AppState {
                receiver: Mutex::new(Some(rx)),
            });

            // Start the Watcher to poll local clipboard
            watcher::start_watcher(handle.clone(), tx);

            // Check for updates silently on startup (background)
            let update_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                use tauri_plugin_updater::UpdaterExt;
                if let Ok(updater) = update_handle.updater() {
                    if let Ok(Some(update)) = updater.check().await {
                        let _ = update_handle.emit("update-available", serde_json::json!({
                            "version": update.version,
                            "notes": update.body.unwrap_or_default()
                        }));
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
