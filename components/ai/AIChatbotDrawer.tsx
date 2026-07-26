"use client";

import React, { useState } from "react";
import { Bot, Sparkles, Send, X, FileText, Zap, HelpCircle } from "lucide-react";

interface AIChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
}

export const AIChatbotDrawer: React.FC<AIChatbotDrawerProps> = ({
  isOpen,
  onClose,
  lessonTitle,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: `Hello Alex! I'm your EduCore AI Assistant. I can summarize "${lessonTitle}", answer code questions, or generate custom quizzes for you!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let reply = `Great question regarding ${lessonTitle}! In Next.js 16 App Router, React Server Components render on the server by default, minimizing bundle size and improving initial load time.`;
      if (userMsg.toLowerCase().includes("summarize") || userMsg.toLowerCase().includes("summary")) {
        reply = `📌 **Lesson Summary**: This lesson covers Next.js 16 App Router setup, configuring Tailwind CSS v4, and organizing server components vs client components. Key takeaway: Use 'use client' only when adding state or event listeners.`;
      } else if (userMsg.toLowerCase().includes("quiz")) {
        reply = `⚡ **Generated Quiz**: 1) What directive makes a component a Client Component? (Answer: 'use client') 2) True/False: Server components can use useState. (Answer: False).`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/95 backdrop-blur-xl border-l border-purple-500/30 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-purple-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-button flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>EduCore AI Tutor</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[10px] text-purple-300">Contextual Assistant for {lessonTitle}</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/50 flex gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => {
            setInput("Summarize this lesson");
          }}
          className="px-2.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 font-semibold hover:bg-purple-900/60 whitespace-nowrap flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          <span>Lesson Summary</span>
        </button>
        <button
          onClick={() => {
            setInput("Generate AI Quiz");
          }}
          className="px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-900/60 whitespace-nowrap flex items-center gap-1"
        >
          <Zap className="w-3 h-3" />
          <span>Generate Quiz</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
              m.sender === "user"
                ? "bg-purple-600 text-white ml-auto rounded-br-none"
                : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-2xl bg-slate-900 text-purple-400 border border-slate-800 max-w-[85%] text-xs font-semibold animate-pulse">
            AI is thinking...
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI anything about this video lesson..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button type="submit" className="p-2 rounded-xl gradient-button text-white">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
