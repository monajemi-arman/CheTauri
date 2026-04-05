import { Dispatch, SetStateAction } from "react";
import { ChatIcon, SettingsIcon } from "../assets/icons";
import "./Header.css";

function Header({ setView }: { setView: Dispatch<SetStateAction<string>> }) {
    return <div className="header">
        <button className="btn btn-wide" onClick={() => setView("chat")}><ChatIcon />Chat</button>
        <button className="btn btn-wide" onClick={() => setView("settings")}><SettingsIcon />Settings</button>
    </div>;
}

export default Header;