import React from "react";
import botIcon from "../assets/logo_01.png";
import userIcon from "../assets/user.png";

export default function ChatBubble({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`w-full flex items-start gap-3 py-3 ${
        isUser ? "justify-end pr-2" : "justify-start pl-2"
      }`}
    >
      {/* ===== Assistant bubble ===== */}
      {!isUser && (
        <>
          <img
            src={botIcon}
            alt="Bot"
            className="w-7 h-7 rounded-full object-cover border border-gray-200 mt-1"
          />
          <div
            className="bg-white rounded-lg px-4 py-2 text-gray-900 shadow-sm border border-gray-100"
            style={{
              maxWidth: "75%",
              minWidth: "40%", // 👈 ensures short responses don’t shrink
            }}
          >
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
              {/* invisible filler to prevent collapse */}
              <span className="invisible select-none">──────────────</span>
            </div>
          </div>
        </>
      )}

      {/* ===== User bubble ===== */}
      {isUser && (
        <>
          <div
            className="bg-[#f7f7f8] border border-gray-200 rounded-lg px-4 py-2 text-gray-900 shadow-sm"
            style={{
              maxWidth: "75%",
              minWidth: "40%", // 👈 also fix user short prompts
            }}
          >
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
              {/* invisible filler to maintain consistent width */}
              <span className="invisible select-none">──────────────</span>
            </div>
          </div>

          <img
            src={userIcon}
            alt="User"
            className="w-7 h-7 rounded-full object-cover border border-gray-200 mt-1"
          />
        </>
      )}
    </div>
  );
}
