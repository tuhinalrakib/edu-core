"use client";

import React, { useState, useEffect } from "react";
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
  Layers,
  GraduationCap,
} from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { API_BASE_URL, CourseType } from "@/lib/api";
import { EduCoreLoader } from "@/components/EduCoreLoader";

// Helper to assign icons based on dynamic category name
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("code") || lower.includes("program") || lower.includes("web") || lower.includes("dev")) return Code;
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("art")) return Palette;
  if (lower.includes("market") || lower.includes("seo") || lower.includes("growth")) return Megaphone;
  if (lower.includes("business") || lower.includes("saas") || lower.includes("finance") || lower.includes("manage")) return Briefcase;
  if (lower.includes("ai") || lower.includes("intelligence") || lower.includes("machine") || lower.includes("deep")) return Cpu;
  if (lower.includes("data") || lower.includes("sql") || lower.includes("analytics") || lower.includes("database")) return Database;
  if (lower.includes("security") || lower.includes("cyber") || lower.includes("hack")) return Lock;
  return Layers;
};

// Helper for vibrant gradients
const getCategoryGradient = (index: number) => {
  const gradients = [
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-amber-500 to-rose-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-fuchsia-500",
    "from-sky-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-teal-500 to-emerald-600",
  ];
  return gradients[index % gradients.length];
};

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch real courses
        const courseRes = await fetch(`${API_BASE_URL}/courses`);
        const courseData = await courseRes.json();
        const loadedCourses: CourseType[] =
          courseData.success && Array.isArray(courseData.courses) ? courseData.courses : [];
        setFeaturedCourses(loadedCourses);

        // 2. Fetch real categories
        const catRes = await fetch(`${API_BASE_URL}/categories`);
        const catData = await catRes.json();
        let loadedCats: any[] = catData.success && Array.isArray(catData.categories) ? catData.categories : [];

        // If categories from DB, enrich each with real course count from loadedCourses
        if (loadedCats.length === 0 && loadedCourses.length > 0) {
          // Extract unique categories directly from existing courses
          const uniqueCats = Array.from(new Set(loadedCourses.map((c) => c.category).filter(Boolean)));
          loadedCats = uniqueCats.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }));
        }

        setCategories(loadedCats);
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Compute dynamic stats
  const totalCoursesCount = featuredCourses.length;
  const totalLessonsCount = featuredCourses.reduce((acc, c) => {
    const secLessons = (c.sections || []).reduce((sAcc: number, s: any) => sAcc + (s.lessons?.length || 0), 0);
    return acc + (secLessons || c.totalLessons || 0);
  }, 0);

  // Group real categories with real course counts
  const dynamicCategories = categories.map((cat, idx) => {
    const catName = typeof cat === "string" ? cat : cat.name;
    const realCourseCount = featuredCourses.filter(
      (c) => c.category?.toLowerCase() === catName?.toLowerCase()
    ).length;

    return {
      name: catName,
      slug: cat.slug || catName.toLowerCase().replace(/\s+/g, "-"),
      count: `${realCourseCount} ${realCourseCount === 1 ? "Course" : "Courses"}`,
      realCount: realCourseCount,
      icon: getCategoryIcon(catName),
      color: getCategoryGradient(idx),
    };
  });

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
              <span>Next-Gen Full-Featured SaaS LMS Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
              Master New Skills with <br className="hidden sm:inline" />
              <span className="gradient-text">Interactive Video Courses</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8">
              EduCore delivers full-screen Udemy-style video players, step-by-step MCQ quizzes, hands-on project assignments, automated certificates, and teacher analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 hover:scale-105 transition-all"
              >
                <span>Browse All Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/teacher/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-slate-200 glass-panel border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Instructor Studio</span>
              </Link>
            </div>
          </div>

          {/* DYNAMIC REAL STATS BANNER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl">
            <div className="text-center p-3">
              <h3 className="text-3xl font-black text-white gradient-text">{totalCoursesCount}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Available Courses</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <h3 className="text-3xl font-black text-white gradient-text">{totalLessonsCount}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Video Lectures</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <h3 className="text-3xl font-black text-white gradient-text">{dynamicCategories.length}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Course Categories</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800/80">
              <h3 className="text-3xl font-black text-white gradient-text">100%</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Verified Certificates</p>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC CATEGORIES SECTION */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Explore Topics</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Popular Categories</h2>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2 md:mt-0"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <EduCoreLoader message="Loading categories" />
          ) : dynamicCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {dynamicCategories.map((cat, idx) => {
                const IconComp = cat.icon;
                return (
                  <Link
                    key={idx}
                    href={`/courses?category=${encodeURIComponent(cat.name)}`}
                    className="glass-card p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4 hover:border-purple-500/40 group transition-all"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors truncate">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{cat.count}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              No categories created in database yet.
            </div>
          )}
        </div>
      </section>

      {/* FEATURED COURSES SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Curated Learning</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Featured Courses</h2>
            <p className="text-slate-400 text-sm mt-2">Explore published courses loaded directly from platform database.</p>
          </div>

          {isLoading ? (
            <EduCoreLoader message="Loading platform courses from database" />
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Courses Available</h3>
              <p className="text-xs text-slate-400 mb-6">No published courses found in database.</p>
              <Link
                href="/teacher/courses/create"
                className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button inline-flex items-center gap-2"
              >
                <span>Create First Course</span>
              </Link>
            </div>
          )}
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
              <h3 className="text-xl font-bold text-white mb-2">Interactive Learning Player</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Distraction-free video playback, structured lesson trees, step-by-step quizzes, and code assignment reviews.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated PDF Certificates</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automatically generate verifiable certificates upon 100% course completion with dynamic verification.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instructor Studio</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Curriculum builders, quiz assessments, assignment evaluation panels, and performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-10 md:p-16 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 text-center relative z-10 shadow-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Join students and instructors scaling their software engineering, design, and technical skills on EduCore today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white gradient-button hover:scale-105 transition-transform"
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
