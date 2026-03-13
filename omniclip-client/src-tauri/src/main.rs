// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod crypto;
mod watcher;
mod ws_client;

#[cfg(test)]
mod tests;


use tauri_plugin_autostart::MacosLauncher;
use tokio::sync::{mpsc, Mutex};
use tauri::Manager;

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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--silently"])))
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![start_sync])
        .setup(|app| {
            let handle = app.handle();
            let (tx, rx) = mpsc::channel(100);

            app.manage(AppState {
                receiver: Mutex::new(Some(rx)),
            });

            // 1. Start the Watcher to poll local clipboard
            watcher::start_watcher(handle.clone(), tx);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
