import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import { Menu } from "lucide-react"; // 👈 icon from lucide-react (already available)

export default function App() {
  const API_URL = "http://localhost:8007/chat";

  const [sessions, setSessions] = useState([]);
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // 👈 sidebar visibility state
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (sessions.length === 0) {
      setSessions([{ id: null, title: "New Chat", messages: [] }]);
      setCurrentSessionIdx(0);
    }
  }, [sessions]);

  useEffect(() => scrollToBottom(), [sessions, currentSessionIdx]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function newChat() {
    const s = { id: null, title: `Chat ${sessions.length + 1}`, messages: [] };
    setSessions((prev) => [...prev, s]);
    setCurrentSessionIdx(sessions.length);
    setInput("");
  }

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newSessions = [...sessions];
    const session = { ...newSessions[currentSessionIdx] };
    session.messages = [...session.messages, { role: "user", content: text }];
    newSessions[currentSessionIdx] = session;
    setSessions(newSessions);
    setInput("");
    setIsTyping(true);

    try {
      const payload = { input: text };
      if (session.id) payload.session_id = session.id;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const json = await res.json();
      const assistantText = json.output ?? "(no reply)";
      const sessionIdFromServer = json.session_id ?? session.id;

      const updatedSessions = [...newSessions];
      const updatedSession = { ...updatedSessions[currentSessionIdx] };
      updatedSession.id = sessionIdFromServer;
      updatedSession.messages = [
        ...updatedSession.messages,
        { role: "assistant", content: assistantText },
      ];
      updatedSessions[currentSessionIdx] = updatedSession;
      setSessions(updatedSessions);
    } catch (err) {
      const updatedSessions = [...sessions];
      const updatedSession = { ...updatedSessions[currentSessionIdx] };
      updatedSession.messages = [
        ...updatedSession.messages,
        { role: "assistant", content: `Error: ${err.message}` },
      ];
      updatedSessions[currentSessionIdx] = updatedSession;
      setSessions(updatedSessions);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  function renameSession(idx, newName) {
    const copy = [...sessions];
    copy[idx] = { ...copy[idx], title: newName };
    setSessions(copy);
  }

  function removeSession(idx) {
    const copy = [...sessions];
    copy.splice(idx, 1);
    setSessions(copy.length ? copy : [{ id: null, title: "New Chat", messages: [] }]);
    setCurrentSessionIdx(Math.max(0, idx - 1));
  }

  function exportSessionToJSON(idx) {
    const session = sessions[idx];
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_session_${idx + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentSession = sessions[currentSessionIdx] || { messages: [] };

  return (
    <div className="min-h-screen flex bg-[#f7f7f8] text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
  sessions={sessions}
  currentSessionIdx={currentSessionIdx}
  setCurrentSessionIdx={setCurrentSessionIdx}
  newChat={newChat}
  renameSession={renameSession}
  removeSession={removeSession}
  exportSessionToJSON={exportSessionToJSON}
  onToggle={(open) => setSidebarOpen(open)} // track open/close
  isOpen={sidebarOpen} // 👈 pass the state directly
/>


      {/* Chat Area */}
      <main
        className={`flex-1 flex flex-col bg-white relative transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-0 w-full"
        }`}
      >
        {/* 👇 Floating button to reopen sidebar */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 bg-gray-100 hover:bg-gray-200 p-2 rounded-xl shadow-md transition"
            title="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <ChatArea
          messages={currentSession.messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput input={input} setInput={setInput} sendMessage={sendMessage} />
      </main>
    </div>
  );
}
