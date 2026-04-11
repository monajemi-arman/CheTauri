import { Dispatch, SetStateAction, useRef, useState } from "react";

export default function ChatInput(
  { setMessage }:
    { setMessage: Dispatch<SetStateAction<string>> }
) {
  const [value, setValue] = useState("");
  const ref: any = useRef(null);

  const handleSend = () => {
    if (!value.trim() || !ref.current.style) return;
    setMessage(value);
    setValue("");
    ref.current.style.height = "auto";
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: any) => {
    setValue(e.target.value);

    // auto resize
    const el = ref.current;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="flex items-stretch m-2">
      <textarea
        ref={ref}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Type a message..."
        className="textarea textarea-bordered flex-1 resize-none overflow-hidden rounded-2xl"
      />
      <button onClick={handleSend} className="btn btn-active h-auto rounded-2xl text-2xl ml-1">
        ➤
      </button>
    </div>
  );
}