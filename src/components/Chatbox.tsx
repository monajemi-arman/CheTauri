import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import "./Chatbox.css";
import { Channel, invoke } from "@tauri-apps/api/core";
import { zip } from "../utils";

interface MessageResponse {
    text: string,
    done: boolean
}

function Chatbox() {
    const [inMessages, setInMessages] = useState([""]);
    const [outMessages, setOutMessages] = useState([""]);
    const [newOutMessage, setNewOutMessage] = useState<string>("");
    const messageChannelRef = useRef<Channel<MessageResponse> | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [inMessages, outMessages]);

    useEffect(() => {
        messageChannelRef.current = new Channel<MessageResponse>();
        messageChannelRef.current.onmessage = (response: MessageResponse) => {
            setInMessages((prev) => {
                const updated = [...prev];
                const lastMessage = prev[prev.length - 1];
                updated[updated.length - 1] = lastMessage.concat(response.text);
                if (response.done === true && updated[updated.length - 1].length !== 0) updated.push("");
                return updated;
            });
        };
    }, []);

    const handleNewOutMessage = async (message: string) => {
        setOutMessages((prev) => {
            const updated = [...prev];
            if (updated[updated.length - 1] === "") {
                updated.pop();
            }
            updated.push(message);
            return updated;
        });
        await invoke("process_out_message", { message, channel: messageChannelRef.current });
    }
    useEffect(() => {
        if (newOutMessage === "") return;
        handleNewOutMessage(newOutMessage).catch(console.error);
        setNewOutMessage("");
    }, [newOutMessage])

    return (
        <div id="chat-container" className="m-2">
            <div id="messages">
                {zip(outMessages, inMessages).map(([outMsg, inMsg], i) => (
                    <div key={i}>
                        {outMsg.length > 0 &&
                            <div className="chat chat-end">
                                <div className="chat-bubble">
                                    {outMsg}
                                </div>
                            </div>
                        }
                        {inMsg.length > 0 &&
                            <div className="chat chat-start">
                                <div className="chat-bubble">
                                    {inMsg}
                                </div>
                            </div>
                        }
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div id="chat-input">
                <ChatInput setMessage={setNewOutMessage} />
            </div>
        </div >
    );
}

export default Chatbox;