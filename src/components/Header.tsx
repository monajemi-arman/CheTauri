import { Dispatch, SetStateAction } from "react";
import { ChatIcon, SettingsIcon } from "../assets/icons";
import "./Header.css";

function Header({ setView, setClearMessages }:
    { 
        setView: Dispatch<SetStateAction<string>>,
        setClearMessages: Dispatch<SetStateAction<boolean>>
    }) {
    return <div className="header">
        <button className="btn btn-wide" onClick={() => setView("chat")}><ChatIcon />Chat</button>
        <button className="btn btn-wide" onClick={() => setView("settings")}><SettingsIcon />Settings</button>
        <button onClick={() => setClearMessages(true)} className="btn btn-warning btn-wide">
            🧹 Clear messages
        </button>
    </div>;
}

export default Header;