use std::{io, sync::Arc};

use futures_util::{lock::Mutex, StreamExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{ipc::Channel, Manager, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio_util::{bytes, io::StreamReader};

static OLLAMA_API: &str = "http://localhost:11434/api/generate";

#[derive(Serialize)]
struct MessageResponse {
    text: String,
    done: bool,
}

#[derive(Serialize)]
struct MessageRequestData<'a> {
    model: &'a str,
    context: Option<Vec<i64>>,
    prompt: &'a str,
    stream: bool,
}

#[derive(Deserialize)]
struct ApiResponseData {
    response: String,
    done: bool,
    context: Option<Vec<i64>>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn process_out_message(
    message: &str,
    channel: Channel<MessageResponse>,
    state: State<'_, Arc<Mutex<AppState>>>,
) -> Result<(), ()> {
    let message_request_data = MessageRequestData {
        model: "tinyllama",
        context: state.lock().await.context.clone(),
        prompt: message,
        stream: true,
    };
    let message_request_data =
        serde_json::to_string(&message_request_data).expect("failed to serialize message");

    let client = Client::new();
    let Ok(res) = client
        .post(OLLAMA_API)
        .body(message_request_data)
        .send()
        .await
    else {
        eprintln!("failed to post to api");
        return Err(());
    };

    let stream = res
        .bytes_stream()
        .map(|result: Result<bytes::Bytes, reqwest::Error>| {
            result.map_err(|e| io::Error::new(io::ErrorKind::Other, e))
        });

    let reader = StreamReader::new(stream);
    let mut lines = BufReader::new(reader).lines();

    while let Ok(line) = lines.next_line().await {
        let Some(line) = line else {
            continue;
        };

        if let Ok(api_response) = serde_json::from_str::<ApiResponseData>(&line) {
            state.lock().await.context = api_response.context;
            channel
                .send(MessageResponse {
                    text: api_response.response,
                    done: api_response.done,
                })
                .expect("broken tauri channel");
        }
    }

    Ok(())
}

#[derive(Default)]
struct AppState {
    context: Option<Vec<i64>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(Mutex::new(AppState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![process_out_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
