"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  Award,
  Flame,
  Clock,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_COURSES } from "@/lib/api";
import { StudentCharts } from "@/components/charts/StudentCharts";
import { GamificationWidget } from "@/components/gamification/GamificationWidget";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/20 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>5 Day Learning Streak Active!</span>
          </div>
          <h1 className="text-3xl font-black text-white">Welcome Back, {user?.name || "Student"}! 👋</h1>
          <p className="text-xs text-slate-400 mt-1">Track your course progress, XP level badges, and daily learning time.</p>
        </div>

        <Link
          href={`/student/learn/${MOCK_COURSES[0].slug}`}
          className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Resume Active Lesson</span>
        </Link>
      </div>

      {/* Gamification XP & Leaderboard */}
      <GamificationWidget />

      {/* Recharts Student Velocity */}
      <StudentCharts />

      {/* Active Enrolled Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">In Progress Courses</h2>
          <Link href="/courses" className="text-xs font-bold text-purple-400 hover:text-purple-300">
            Browse More Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_COURSES.map((course) => (
            <div key={course._id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-24 h-16 rounded-xl object-cover border border-slate-800"
                />
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{course.category}</span>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{course.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">By {course.teacher.name}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Course Progress</span>
                  <span className="text-purple-400 font-bold">45%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 w-[45%]" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="text-xs text-slate-400">Next: Component Setup</span>
                <Link
                  href={`/student/learn/${course.slug || course._id}`}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>Resume Player</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
