"use client";

import React from "react";
import { Flame, Trophy, Award, Zap, Star } from "lucide-react";

interface GamificationWidgetProps {
  totalXP?: number;
  completedLessonsCount?: number;
  passedQuizzesCount?: number;
  submittedAssignmentsCount?: number;
  completedCoursesCount?: number;
  user?: any;
}

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
  totalXP = 0,
  completedLessonsCount = 0,
  passedQuizzesCount = 0,
  submittedAssignmentsCount = 0,
  completedCoursesCount = 0,
  user,
}) => {
  const currentLevel = Math.max(1, Math.floor(totalXP / 500) + 1);
  const currentLevelXP = totalXP % 500;
  const xpToNextLevel = 500 - currentLevelXP;
  const progressPercent = totalXP > 0 ? Math.min(100, Math.round((currentLevelXP / 500) * 100)) : 0;

  const BADGES = [
    {
      name: "Fast Learner",
      icon: "🚀",
      desc: "Complete 5 lessons",
      unlocked: completedLessonsCount >= 5,
    },
    {
      name: "Quiz Master",
      icon: "⚡",
      desc: "Pass 1 quiz assessment",
      unlocked: passedQuizzesCount >= 1,
    },
    {
      name: "Code Ninja",
      icon: "🥷",
      desc: "Submit 1 project assignment",
      unlocked: submittedAssignmentsCount >= 1,
    },
    {
      name: "Certificate Champ",
      icon: "🎓",
      desc: "Complete 1 full course",
      unlocked: completedCoursesCount >= 1,
    },
  ];

  const unlockedCount = BADGES.filter((b) => b.unlocked).length;

  const userName = user?.name || "Student";
  const userAvatar = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

  const studentEntry = {
    name: `${userName} (You)`,
    xp: totalXP,
    avatar: userAvatar,
    isSelf: true,
  };

  const otherStudents = [
    { name: "Elena Rostova", xp: 450, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", isSelf: false },
    { name: "Marcus Vance", xp: 300, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", isSelf: false },
  ];

  const allRankings = [...otherStudents, studentEntry].sort((a, b) => b.xp - a.xp).map((u, i) => ({
    ...u,
    rank: i + 1,
  }));

  return (
    <div className="space-y-6">
      {/* 1. XP & Level Progress */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-inner">
              Lvl {currentLevel}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">Mastery Level {currentLevel}</h3>
              <p className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                <span>{totalXP.toLocaleString()} Total XP</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 shrink-0 whitespace-nowrap">
            {xpToNextLevel} XP to Lvl {currentLevel + 1}
          </span>
        </div>

        {/* Level XP Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{currentLevelXP} XP in Level</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Badges Collection */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Earned Badges</span>
            <span className="text-purple-400 font-bold">{unlockedCount} / {BADGES.length} Unlocked</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BADGES.map((b, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  b.unlocked
                    ? "bg-slate-900/90 border-purple-500/30 text-slate-100 hover:border-purple-500/60 shadow-sm"
                    : "bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-50"
                }`}
                title={`${b.name}: ${b.desc} (${b.unlocked ? "Unlocked" : "Locked"})`}
              >
                <div className="text-xl sm:text-2xl mb-1">{b.icon}</div>
                <p className="text-[10px] font-bold truncate w-full">{b.name}</p>
                <p className="text-[8px] text-slate-400 truncate w-full mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Class Leaderboard */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Leaderboard</span>
          </h3>
          <span className="text-[11px] font-bold text-purple-300 bg-purple-900/40 border border-purple-500/30 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Weekly
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          {allRankings.map((u) => (
            <div
              key={u.name}
              className={`py-2.5 flex items-center justify-between gap-3 ${
                u.isSelf ? "bg-purple-950/20 -mx-2 px-2 rounded-xl" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-[11px] shrink-0 ${
                    u.rank === 1
                      ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30"
                      : u.rank === 2
                      ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  #{u.rank}
                </span>
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                />
                <span className={`truncate text-xs ${u.isSelf ? "font-bold text-purple-300" : "font-semibold text-slate-200"}`}>
                  {u.name}
                </span>
              </div>
              <span className="font-extrabold text-amber-400 text-xs shrink-0 whitespace-nowrap">
                {u.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
