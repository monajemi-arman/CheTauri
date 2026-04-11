import { useEffect, useRef, useState } from "react"
import ModelSelect from "./ModelSelect";
import "./Settings.css";
import { invoke } from "@tauri-apps/api/core";

function Settings() {
    const [model, setModel] = useState("");
    const [llmApi, setLlmApi] = useState("");
    const [customContext, setCustomContext] = useState<string | null>(null);
    const [savedModel, setSavedModel] = useState(false);
    const [savedLlmApi, setSavedLlmApi] = useState(false);
    const [savedContext, setSavedContext] = useState(false);
    const refTextArea = useRef<HTMLTextAreaElement | null>(null);

    const handleLlmApi = async (llmApi: string) => {
        await invoke("set_llm_api", { llmApi });
        return true;
    };

    const handleModel = async (model: string) => {
        await invoke("set_model", { model });
        return true;
    };

    const handleCustomContext = async (customContext: string | null) => {
        if (customContext === "") customContext = null;
        await invoke("set_custom_context", { customContext });
        await invoke("clear_context");
        return true;
    }

    const getCustomContext = async () => {
        const stateCustomContext: string = await invoke("get_custom_context");
        setCustomContext(stateCustomContext);
    }
    useEffect(() => {
        getCustomContext().catch(console.error);
        invoke("get_model").then((x: any) => setModel(x));
        invoke("get_llm_api").then((x: any) => setLlmApi(x));
    }, []);

    return <div id="settings-container">
        <div>
            <div className="space-y-2 relative w-64">
            <label className="text-sl font-bold">Ollama API URL</label>
            <input
                className="border rounded px-3 py-2 w-full"
                value={llmApi}
                onChange={(e) => {
                    setLlmApi(e.target.value);
                    setSavedModel(false);
                }}
                placeholder="http://localhost:11434/api/generate"
            />
            <button className={`btn ${savedLlmApi ? "btn-success" : "btn-neutral"} my-2`}
                onClick={() => handleLlmApi(llmApi).then(setSavedLlmApi)}
            >
                {savedLlmApi ? "Saved" : "Save"}
            </button>
            </div>
            <ModelSelect value={model} setValue={setModel} setSavedModel={setSavedModel} />
            <button className={`btn ${savedModel ? "btn-success" : "btn-neutral"} my-2`}
                onClick={() => handleModel(model).then(setSavedModel)}
            >
                {savedModel ? "Saved" : "Save"}
            </button>
        </div>
        <div className="h-full w-px bg-gray-300 mx-2"></div>
        <div className="flex flex-col justify-center items-stretch">
            <div>
                <label className="text-sl font-bold">Choose custom context for model (only .txt)</label><br />
                <input type="file" onChange={(x) => {
                    const files = x.target.files;
                    if (files) {
                        setSavedContext(false)
                        files[0].text().then((text) => {
                            handleCustomContext(text)
                                .then(setSavedContext);
                        })
                    }
                }} className="file-input" />
            </div>
            <div className="my-4">
                <label className="text-sl font-bold"><center>OR</center><br />Write your custom context here:</label><br />
                <textarea ref={refTextArea} defaultValue={customContext || ""} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <button className={`btn ${savedContext ? "btn-success" : "btn-neutral"} my-2`}
                onClick={() => {
                    const textAreaValue = refTextArea.current?.value
                    if (textAreaValue) {
                        handleCustomContext(textAreaValue)
                            .then(setSavedContext);
                    }
                }}
            >
                {savedContext ? "Saved" : "Save"}
            </button>
            <button className={`btn btn-warning`}
                onClick={() =>
                    handleCustomContext(null).catch(console.error)
                }
            >
                Erase context
            </button>
        </div>
    </div>
}

export default Settings;