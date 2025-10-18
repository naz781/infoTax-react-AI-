import React, { useState } from "react";
import { Menu, Edit3 } from "lucide-react";
import icon01 from "../assets/logo_01.png";

export default function Sidebar({
  sessions,
  currentSessionIdx,
  setCurrentSessionIdx,
  newChat,
  renameSession,
  removeSession,
  exportSessionToJSON,
  onToggle,
  isOpen, // 👈 controlled by App.jsx
}) {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  if (!isOpen) return null; // controlled visibility

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-[#f7f7f8] flex flex-col transition-all duration-300">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <img src={icon01} alt="App Logo" className="w-8 h-8 object-contain" />
        <button
          onClick={() => onToggle(false)} // 👈 close via parent
          className="p-2 rounded-md hover:bg-gray-200 transition"
          title="Close sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ===== New Chat Button ===== */}
      <div
        onClick={newChat}
        className="flex items-center gap-2 px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors"
      >
        <Edit3 size={15} />
        <span className="text-sm font-medium">New chat</span>
      </div>

      {/* ===== Chats Header ===== */}
      <div className="px-4 mt-10 mb-1 text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
        Chats
      </div>

      {/* ===== Chat List ===== */}
      <div className="flex-1 overflow-auto px-2 space-y-[2px]">
        {sessions.map((s, i) => (
          <div
            key={i}
            className={`group relative px-3 py-[4px] rounded-md cursor-pointer transition-colors ${
              i === currentSessionIdx
                ? "bg-gray-200"
                : "hover:bg-gray-100 active:bg-gray-200"
            }`}
            onClick={() => setCurrentSessionIdx(i)}
          >
            <div className="flex justify-between items-center">
              {/* Title */}
              <div
                className="font-medium truncate text-[13px] text-gray-800"
                title={s.title}
              >
                {s.title || `Chat ${i + 1}`}
              </div>

              {/* Dots Menu */}
              <div className="relative z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === i ? null : i);
                  }}
                  className="opacity-60 hover:opacity-100 px-1.5 py-[1px] rounded hover:bg-gray-200"
                >
                  ⋯
                </button>

                {dropdownOpen === i && (
                  <div
                    className="absolute right-0 top-full mt-1 w-28 bg-white shadow-md rounded-lg border text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
                      onClick={() => {
                        const newName = prompt("New chat title:", s.title);
                        if (newName) renameSession(i, newName);
                        setDropdownOpen(null);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
                      onClick={() => {
                        exportSessionToJSON(i);
                        setDropdownOpen(null);
                      }}
                    >
                      Export
                    </button>
                    <button
                      className="block w-full text-left px-3 py-1.5 text-red-600 hover:bg-gray-100"
                      onClick={() => {
                        removeSession(i);
                        setDropdownOpen(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
