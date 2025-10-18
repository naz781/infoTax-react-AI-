import React, { useRef, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({ input, setInput, sendMessage }) {
  const textareaRef = useRef(null);
  const [height, setHeight] = useState("auto");

  // Auto-expand textarea like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      setHeight(`${textareaRef.current.scrollHeight}px`);
    }
  }, [input]);

  return (
    <form
      onSubmit={sendMessage}
      className="fixed bottom-0 left-64 w-[calc(100%-16rem)] bg-gradient-to-t from-white via-white to-transparent p-6 flex justify-center border-t border-gray-200"
    >
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="relative w-full flex items-end bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-300 hover:border-gray-400 transition">
          <textarea
            ref={textareaRef}
            style={{ height }}
            rows={1}
            placeholder="Message Lecture Assistant..."
            className="flex-1 resize-none bg-transparent px-4 py-3 pr-12 text-gray-900 rounded-2xl focus:outline-none focus:ring-0 placeholder-gray-400 text-base overflow-hidden"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-full transition ${
              input.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Lecture Assistant may make mistakes — verify important information.
        </p>
      </div>
    </form>
  );
}
