import { Dispatch, SetStateAction, useState } from "react"

const options = ["llama3.1:8b", "deepseek-r1:7b", "tinyllama"];

export default function ModelSelect({ value, setValue, setSavedModel }: {
    value: string,
    setValue: Dispatch<SetStateAction<string>>,
    setSavedModel: Dispatch<SetStateAction<boolean>>,
}) {
    const [open, setOpen] = useState(false);

    const filtered = options.filter(o =>
        o.toLowerCase().includes(value.toLowerCase())
    );

    return (
        <div className="space-y-2 relative w-64" onBlur={() => setOpen(false)}>
            <label className="text-sl font-bold">Model name</label>

            <input
                className="border rounded px-3 py-2 w-full"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setSavedModel(false);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder="Type or select model"
            />

            {open && filtered.length > 0 && (
                <div className="absolute border rounded w-full bg-white shadow">
                    {filtered.map((option) => (
                        <div
                            key={option}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => {
                                setValue(option);
                                setSavedModel(false);
                                setOpen(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}