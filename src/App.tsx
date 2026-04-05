import { useState } from "react";
import "./App.css";
import Chatbox from "./components/Chatbox";
import Header from "./components/Header";
import Settings from "./components/Settings";

function App() {
  const [view, setView] = useState("chat");

  return (
    <main className="container">
      <Header setView={setView} />
      {view == "chat" && <Chatbox />}
      {view == "settings" && <Settings />}
    </main>
  );
}

export default App;
