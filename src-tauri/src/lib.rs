use std::{
    fs::{read_to_string, write},
    io,
    sync::Arc,
};

use futures_util::{lock::Mutex, StreamExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{async_runtime::spawn, ipc::Channel, Manager, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio_util::{bytes, io::StreamReader};

static OLLAMA_API: &str = "http://localhost:11434/api/generate";
static CONFIG_PATH: &str = "config.json";
static FALLBACK_MODEL: &str = "tinyllama";

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
    let fallback_model = FALLBACK_MODEL.to_string();
    let state_lock = state.lock().await;
    let context = state_lock.context.clone();
    let mut prompt: String = message.to_string();

    if context.is_none() {
        if let Some(custom_context) = state_lock.custom_context.clone() {
            prompt = format!(
                "You are answering questions based on the context below.
                Context:
                {}
                Question:
                {}",
                custom_context, message
            );
        }
    }

    let message_request_data = MessageRequestData {
        model: state_lock
            .model
            .as_ref()
            .unwrap_or(&fallback_model)
            .as_str(),
        context,
        prompt: prompt.as_str(),
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

#[tauri::command]
async fn get_custom_context(state: State<'_, Arc<Mutex<AppState>>>) -> Result<String, ()> {
    Ok(state
        .lock()
        .await
        .custom_context
        .as_ref()
        .expect("failed to get custom context from app state")
        .clone())
}

#[tauri::command]
async fn set_custom_context(
    custom_context: &str,
    state: State<'_, Arc<Mutex<AppState>>>,
) -> Result<(), ()> {
    let mut state_lock = state.lock().await;
    let state_custom_context = state_lock
        .custom_context
        .as_mut()
        .expect("failed to get mut custom context from app state");

    *state_custom_context = custom_context.to_string();
    state_lock.save();
    Ok(())
}

#[tauri::command]
async fn clear_context(state: State<'_, Arc<Mutex<AppState>>>) -> Result<(), ()> {
    let mut state_lock = state.lock().await;
    state_lock.context = None;
    state.lock().await.save();
    Ok(())
}

#[tauri::command]
async fn set_model(model: &str, state: State<'_, Arc<Mutex<AppState>>>) -> Result<(), ()> {
    let mut state_lock = state.lock().await;
    state_lock.model = Some(model.to_string());
    state_lock.save();
    Ok(())
}

#[derive(Default, Serialize, Deserialize)]
struct AppState {
    model: Option<String>,
    custom_context: Option<String>,
    context: Option<Vec<i64>>,
}

impl AppState {
    fn save(&self) {
        let contents = serde_json::to_string(&self).expect("failed to serialize app state");
        write(CONFIG_PATH, contents)
            .expect(&["failed to save app state to ", CONFIG_PATH].concat());
    }

    fn load(&mut self) {
        let Ok(contents) = read_to_string(CONFIG_PATH) else {
            return;
        };
        let new_app_state: AppState = serde_json::from_str(&contents)
            .expect(&["failed to deserialize app state from ", CONFIG_PATH].concat());
        *self = new_app_state;
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(Mutex::new(AppState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let app_state_clone = app_state.clone();

            spawn(async move {
                app_state_clone.lock().await.load();
            });

            app.manage(app_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            process_out_message,
            set_model,
            set_custom_context,
            clear_context,
            get_custom_context
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
