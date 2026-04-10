import { useEffect, useRef, useState } from "react"
import ModelSelect from "./ModelSelect";
import "./Settings.css";
import { invoke } from "@tauri-apps/api/core";

function Settings() {
    const [model, setModel] = useState("");
    const [customContext, setCustomContext] = useState("");
    const [savedModel, setSavedModel] = useState(false);
    const [savedContext, setSavedContext] = useState(false);
    const refTextArea = useRef<HTMLTextAreaElement | null>(null);

    const handleModel = async (model: string) => {
        await invoke("set_model", { model });
        return true;
    }

    const handleCustomContext = async (custom_context: string) => {
        await invoke("set_custom_context", { custom_context });
        await invoke("clear_context");
        return true;
    }

    const getCustomContext = async () => {
        const stateCustomContext: string = await invoke("get_custom_context");
        setCustomContext(stateCustomContext);
    }
    useEffect(() => { getCustomContext().catch(console.error) }, []);

    return <div id="settings-container">
        <div>
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
                <textarea ref={refTextArea} defaultValue={customContext} className="w-full border border-gray-300 rounded-md p-2" />
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
        </div>
    </div>
}

export default Settings;