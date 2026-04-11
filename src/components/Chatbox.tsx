import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import { Channel, invoke } from "@tauri-apps/api/core";
import { zip } from "../utils";
import "./Chatbox.css";

interface MessageResponse {
    text: string,
    done: boolean
}

function Chatbox({ clearMessages, setClearMessages }:
    {
        clearMessages: boolean,
        setClearMessages: Dispatch<SetStateAction<boolean>>
    }) {
    const [inMessages, setInMessages] = useState([""]);
    const [outMessages, setOutMessages] = useState([""]);
    const [newOutMessage, setNewOutMessage] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [inMessages, outMessages]);

    const handleNewOutMessage = async (message: string) => {
        setOutMessages((prev) => {
            const updated = [...prev];
            if (updated[updated.length - 1] === "") {
                updated.pop();
            }
            updated.push(message);
            return updated;
        });

        const messageChannel = new Channel<MessageResponse>();
        messageChannel.onmessage = (response: MessageResponse) => {
            console.log("3")
            setInMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                updated[updated.length - 1] = lastMessage.concat(response.text);
                if (response.done === true && updated[updated.length - 1].length !== 0) updated.push("");
                return updated;
            });
        };

        await invoke("process_out_message", { message, channel: messageChannel });
    }
    useEffect(() => {
        if (newOutMessage === "") return;
        handleNewOutMessage(newOutMessage)
            .then(() => {
                setNewOutMessage("");
            })
            .catch(console.error);
    }, [newOutMessage])

    useEffect(() => {
        if (clearMessages === true) {
            setInMessages([""]);
            setOutMessages([""]);
        }
        else {
            setClearMessages(false);
        }
    }, [clearMessages]);

    return (
        <div id="chat-container" className="m-2">
            <div id="messages">
                {(outMessages[0] === "" && inMessages[0] === "") && (
                    <div id="welcome-box">
                        <h1><center><b>Welcome!</b></center></h1>
                        <p>Start writing your first message!</p>
                        <p>You can also feed custom text as context to the model, using the <b>Settings</b> above.</p>
                    </div>
                )}
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