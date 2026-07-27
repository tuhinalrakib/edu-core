"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe,
  Code,
  Palette,
  Megaphone,
  Briefcase,
  Cpu,
  Database,
  Lock,
} from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { MOCK_COURSES } from "@/lib/api";

const CATEGORIES = [
  { name: "Programming", icon: Code, count: "140+ Courses", color: "from-purple-500 to-indigo-500" },
  { name: "UI/UX Design", icon: Palette, count: "95+ Courses", color: "from-blue-500 to-cyan-500" },
  { name: "Digital Marketing", icon: Megaphone, count: "75+ Courses", color: "from-amber-500 to-rose-500" },
  { name: "Business & SaaS", icon: Briefcase, count: "110+ Courses", color: "from-emerald-500 to-teal-500" },
  { name: "Artificial Intelligence", icon: Cpu, count: "80+ Courses", color: "from-violet-500 to-fuchsia-500" },
  { name: "Data Science", icon: Database, count: "65+ Courses", color: "from-sky-500 to-blue-600" },
  { name: "Cyber Security", icon: Lock, count: "50+ Courses", color: "from-rose-500 to-pink-600" },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Glowing background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-100 h-100 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Next.js 16 & Express Powered SaaS LMS Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
              Master New Skills with <br className="hidden sm:inline" />
              <span className="gradient-text">World-Class Online Courses</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8">
              EduCore gives you full-screen Udemy-style video players, interactive quizzes, automated PDF certificates, real-time analytics, and seamless Stripe payments for students and creators.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/teacher/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-slate-200 glass-panel border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Start Teaching Today</span>
              </Link>
            </div>
          </div>

          {/* STATS BANNER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
            <div className="text-center p-3">
              <h3 className="text-3xl font-black text-white gradient-text">25,000+</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Active Students</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <h3 className="text-3xl font-black text-white gradient-text">450+</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Expert Instructors</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <h3 className="text-3xl font-black text-white gradient-text">1,200+</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Video Courses</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <h3 className="text-3xl font-black text-white gradient-text">99.4%</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Explore Topics</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Popular Categories</h2>
            </div>
            <Link href="/courses" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2 md:mt-0">
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4 hover:border-purple-500/40 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${cat.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{cat.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Curated Learning</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Featured & Trending Courses</h2>
            <p className="text-slate-400 text-sm mt-2">Hand-picked interactive courses built with video lessons, downloadable resources, and quizzes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_COURSES.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES SECTION */}
      <section className="py-20 bg-slate-950/80 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Why Choose EduCore</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Everything You Need for Modern Learning</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-6">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Udemy-Style Learning Player</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Full-screen distraction-free video playback, sidebar lesson trees, downloadable PDF attachments, auto progress saving, and note taking.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated PDF Certificates</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automatically generate verifiable PDF certificates with student name, course title, teacher signature, and QR code verification upon completion.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">SaaS Instructor Dashboard</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Teachers get drag-and-drop course builders, quiz creators, assignment reviewers, earnings analytics, commission logs, and Stripe payout requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-10 md:p-16 border border-purple-500/30 bg-linear-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 text-center relative z-10 shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Join thousands of students and instructors scaling their software engineering, design, and business skills on EduCore today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white gradient-button"
              >
                Create Free Account
              </Link>
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
