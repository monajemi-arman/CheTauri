import { useState } from "react";
import "./App.css";
import Chatbox from "./components/Chatbox";
import Header from "./components/Header";
import Settings from "./components/Settings";

function App() {
  const [view, setView] = useState("chat");
  const [clearMessages, setClearMessages] = useState(false);

  return (
    <main className="container">
      <Header setView={setView} setClearMessages={setClearMessages} />
      {view == "chat" && <Chatbox clearMessages={clearMessages} setClearMessages={setClearMessages} />}
      {view == "settings" && <Settings />}
    </main>
  );
}

export default App;
