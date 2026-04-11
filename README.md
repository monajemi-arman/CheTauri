# CheTauri
In Persian, "che tori" means "how are you". This project is about a chatbot interface written using Tauri so I named it **CheTauri**.  
Written with Rust (Tauri) as backend and React (Vite, Typescript) for frontend.

# Screenshots
![main app page](./public/demo-1.png)
![settings app page](./public/demo-2.png)

# Requirements
* Official Docker installation with NVIDIA Cuda Runtime Container Toolkit enabled

# Usage
* Clone this repository
* Inside project directory, run `docker compose up` to start the Ollama API for local LLM.
* Install required npm modules into the project directory with `npm install`
* Build the app with `npm run tauri build`
* Run the built executable found inside `src-tauri/target` sub-folders.