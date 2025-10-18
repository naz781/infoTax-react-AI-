import React from "react";

export default function TypingDots() {
  return (
    <div className="flex items-end gap-1 h-6">
      <span className="w-2 h-2 rounded-full animate-bounce bg-gray-400"></span>
      <span className="w-2 h-2 rounded-full animate-bounce bg-gray-400 delay-150"></span>
      <span className="w-2 h-2 rounded-full animate-bounce bg-gray-400 delay-300"></span>
    </div>
  );
}
