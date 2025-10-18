import React, { useEffect } from "react";
import ChatBubble from "./ChatBubble";
import TypingDots from "./TypingDots";

export default function ChatArea({ messages, isTyping, messagesEndRef }) {
  // Auto-scroll whenever messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-auto bg-white flex justify-center px-4 sm:px-8 py-6">
      <div className="flex flex-col w-full max-w-[800px] mx-200 pb-28">
        {/* ===== Empty state ===== */}
        {messages.length === 0 ? (
          <div className="text-gray-600 text-center mt-24 space-y-4 px-2">
            <h2 className="text-2xl font-semibold">
              Welcome to Lecture Assistant Chat
            </h2>
            <p>Start a conversation by typing your question below.</p>
          </div>
        ) : (
          messages.map((m, i) => <ChatBubble key={i} msg={m} />)
        )}

        {/* ===== Typing dots ===== */}
        {isTyping && (
          <div className="py-4 flex justify-start">
            <div className="bg-[#f7f7f8] p-3 rounded-lg text-gray-900 shadow-sm border border-gray-200">
              <TypingDots />
            </div>
          </div>
        )}

        {/* ===== Scroll spacer ===== */}
        <div ref={messagesEndRef} />
        <div className="h-10" /> {/* extra scroll space for smooth bottom padding */}
      </div>
    </div>
  );
}
