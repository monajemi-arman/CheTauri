import { useRef, useState } from "react"
import ModelSelect from "./ModelSelect";
import "./Settings.css";

function Settings() {
    const [model, setModel] = useState("");
    const [context, setContext] = useState("");
    const [savedModel, setSavedModel] = useState(false);
    const [savedContext, setSavedContext] = useState(false);
    const refTextArea = useRef<HTMLTextAreaElement | null>(null);

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
                    if (x.target.files) {
                        setSavedContext(false)
                        x.target.files[0].text().then(setContext)
                    }
                }} className="file-input" />
            </div>
            <div className="my-4">
                <label className="text-sl font-bold"><center>OR</center><br />Write your custom context here:</label><br />
                <textarea ref={refTextArea} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <button className={`btn ${savedContext ? "btn-success" : "btn-neutral"} my-2`}
                onClick={() => handleContext(model).then(setSavedContext)}
            >
                {savedContext ? "Saved" : "Save"}
            </button>
        </div>
    </div>
}

const handleModel = async (model: string) => {
    return true
}

const handleContext = async (model: string) => {
    return true
}

export default Settings;