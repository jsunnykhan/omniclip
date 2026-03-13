// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod crypto;
mod watcher;
mod ws_client;

#[cfg(test)]
mod tests;

use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use tokio::sync::mpsc;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--silently"])))
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let handle = app.handle();
            let (tx, rx) = mpsc::channel(100);

            // 1. Start the Watcher to poll local clipboard
            watcher::start_watcher(handle.clone(), tx);

            // 2. Start the WebSocket Client to relay/sync (In a real app, token & device_id are stored securely)
            let token = "development_token".to_string(); 
            let device_id = "device_123".to_string();
            
            let ws_handle = handle.clone();
            tokio::spawn(async move {
                ws_client::start_ws_client(ws_handle, token, device_id, rx).await;
            });

            // Note: iOS Silent Push and Android Foreground Service Setup 
            // is typically configured natively in Info.plist / AndroidManifest.xml
            // but controlled via Tauri mobile plugins.

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
