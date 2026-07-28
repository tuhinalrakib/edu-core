"use client";

import React from "react";
import { Flame, Trophy, Award, Zap, Star } from "lucide-react";

export const GamificationWidget: React.FC = () => {
  const BADGES = [
    { name: "Fast Learner", icon: "🚀", desc: "Completed 5 lessons in 1 day", unlocked: true },
    { name: "Quiz Master", icon: "⚡", desc: "Scored 100% on first quiz try", unlocked: true },
    { name: "Code Ninja", icon: "🥷", desc: "Submitted code assignment", unlocked: true },
    { name: "Certificate Champ", icon: "🎓", desc: "Earned first verified PDF cert", unlocked: false },
  ];

  const LEADERBOARD = [
    { rank: 1, name: "Dr. Elena Rostova", xp: 4850, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    { rank: 2, name: "Alex Rivera (You)", xp: 3250, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { rank: 3, name: "Marcus Vance", xp: 2900, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* XP & Level Progress */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl">
              Lvl 5
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mastery Level 5</h3>
              <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>3,250 Total XP</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">750 XP to Lvl 6</span>
        </div>

        {/* Level XP Bar */}
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div className="h-full bg-linear-to-r from-amber-500 via-purple-500 to-indigo-500 w-[80%]" />
        </div>

        {/* Badges Collection */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Earned Badges</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((b, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-center space-y-1 ${
                  b.unlocked
                    ? "bg-slate-900/90 border-purple-500/40 text-slate-100"
                    : "bg-slate-950/40 border-slate-900 text-slate-600 opacity-60"
                }`}
              >
                <div className="text-2xl">{b.icon}</div>
                <p className="text-[11px] font-bold truncate">{b.name}</p>
                <p className="text-[9px] text-slate-400 line-clamp-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Global Student Leaderboard</span>
          </h3>
          <span className="text-xs text-purple-400 font-semibold">Weekly Ranking</span>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {LEADERBOARD.map((user) => (
            <div key={user.rank} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                    user.rank === 1
                      ? "bg-amber-400 text-slate-950"
                      : user.rank === 2
                      ? "bg-purple-500 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  #{user.rank}
                </span>
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold text-slate-200">{user.name}</span>
              </div>
              <span className="font-extrabold text-amber-400">{user.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
