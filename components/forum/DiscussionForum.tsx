"use client";

import React, { useState } from "react";
import { MessageSquare, ThumbsUp, CheckCircle, Plus, Send } from "lucide-react";

export const DiscussionForum: React.FC = () => {
  const [threads, setThreads] = useState([
    {
      id: "t1",
      author: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      title: "Difference between server action and traditional API route?",
      content: "When should I use Server Actions in Next.js 16 vs creating standard route.ts files?",
      upvotes: 14,
      solved: true,
      repliesCount: 3,
      date: "2 hours ago",
    },
    {
      id: "t2",
      author: "Michael Chang",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      title: "Stripe webhook signature validation failing locally",
      content: "Having issues with stripe listen command on Windows localhost.",
      upvotes: 6,
      solved: false,
      repliesCount: 1,
      date: "5 hours ago",
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setThreads([
      {
        id: "t-" + Date.now(),
        author: "Alex Rivera (You)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        title: newTitle,
        content: newContent,
        upvotes: 1,
        solved: false,
        repliesCount: 0,
        date: "Just now",
      },
      ...threads,
    ]);
    setNewTitle("");
    setNewContent("");
    setShowAddForm(false);
  };

  const handleUpvote = (id: string) => {
    setThreads(
      threads.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Course Q&A Forum</h3>
          <p className="text-xs text-slate-400">Ask questions, share code snippets, and help fellow students.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Ask New Question</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handlePost} className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-3">
          <input
            type="text"
            placeholder="Question Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <textarea
            rows={3}
            placeholder="Describe your question or error details..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Post Question</span>
          </button>
        </form>
      )}

      <div className="space-y-3">
        {threads.map((thread) => (
          <div key={thread.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <img src={thread.avatar} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{thread.title}</h4>
                    {thread.solved && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Solved
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{thread.author} • {thread.date}</p>
                </div>
              </div>

              <button
                onClick={() => handleUpvote(thread.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 text-xs font-bold"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{thread.upvotes}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 pl-11">{thread.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
