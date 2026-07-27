"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Home,
  Compass,
  GraduationCap,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Briefcase,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/courses");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient Glowing Background Lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
        {/* Brand Logo Header */}
        <div className="inline-flex items-center gap-3 glass-panel px-5 py-2.5 rounded-full border border-purple-500/30 shadow-xl shadow-purple-500/10">
          <div className="w-8 h-8 rounded-xl gradient-button flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight">
            Edu<span className="gradient-text">Core</span> <span className="text-slate-400 font-semibold text-xs">SaaS LMS</span>
          </span>
        </div>

        {/* Big Animated 404 Badge */}
        <div className="space-y-3">
          <div className="relative inline-block">
            <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 select-none animate-pulse">
              404
            </h1>
            <div className="absolute -top-2 -right-4 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Page Not Found</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Oops! Lost in the Learning Path?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
            The page or course lesson you are looking for might have been moved, renamed, or doesn't exist. Let's get you back on track!
          </p>
        </div>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses, categories, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-11 pr-24 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-xs font-bold text-white gradient-button shadow-md flex items-center gap-1"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Action Buttons & Navigation Shortcuts */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/courses"
            className="px-6 py-3 rounded-xl text-xs font-bold text-slate-200 glass-panel border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Explore Catalog</span>
          </Link>

          <Link
            href="/student/dashboard"
            className="px-6 py-3 rounded-xl text-xs font-bold text-slate-200 glass-panel border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>My Learning</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Need help? Contact EduCore Support or visit our Knowledge Base.</span>
        </div>
      </div>
    </div>
  );
}
