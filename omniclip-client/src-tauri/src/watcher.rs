use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;
use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};

pub fn start_watcher(app: AppHandle, tx: mpsc::Sender<String>) {
    tauri::async_runtime::spawn(async move {
        let mut last_clipboard = String::new();

        loop {
            if let Ok(current_clipboard) = app.clipboard().read_text() {
                if current_clipboard != last_clipboard && !current_clipboard.is_empty() {
                    last_clipboard = current_clipboard.clone();
                    let _ = tx.send(current_clipboard).await;
                }
            }
            sleep(Duration::from_millis(500)).await;
        }
    });
}
