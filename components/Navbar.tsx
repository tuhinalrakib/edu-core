"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Search,
  User,
  LogOut,
  Bell,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, switchRole, isDemo, clearDemoSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Automatically reset demo preview when visiting Home page so guest users get clean home screen
  useEffect(() => {
    if (pathname === "/" && isDemo) {
      clearDemoSession();
    }
  }, [pathname, isDemo, clearDemoSession]);

  const handleRoleSwitch = (role: "student" | "teacher" | "admin") => {
    switchRole(role);
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "teacher") router.push("/teacher/dashboard");
    else router.push("/student/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      {/* Quick Role Switcher Bar - ONLY visible for Guests / Demo Preview, disappears when user logs in */}
      {(!user || isDemo) && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-4 py-1.5 text-xs flex justify-between items-center border-b border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>EduCore SaaS LMS Demo Role Switcher:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRoleSwitch("student")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                user?.role === "student" && isDemo
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              👨‍🎓 Student Role
            </button>
            <button
              onClick={() => handleRoleSwitch("teacher")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                user?.role === "teacher" && isDemo
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              👨‍🏫 Teacher Role
            </button>
            <button
              onClick={() => handleRoleSwitch("admin")}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                user?.role === "admin" && isDemo
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              👑 Admin Role
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Edu<span className="gradient-text">Core</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase -mt-1">
                SaaS Learning
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, categories, teachers..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/courses"
              className={`hover:text-purple-400 transition-colors ${
                pathname === "/courses" ? "text-purple-400 font-semibold" : "text-slate-300"
              }`}
            >
              Explore Courses
            </Link>

            {user?.role === "student" && (
              <Link
                href="/student/dashboard"
                className={`hover:text-purple-400 transition-colors ${
                  pathname.startsWith("/student") ? "text-purple-400 font-semibold" : "text-slate-300"
                }`}
              >
                My Learning
              </Link>
            )}

            {user?.role === "teacher" && (
              <Link
                href="/teacher/dashboard"
                className={`hover:text-purple-400 transition-colors ${
                  pathname.startsWith("/teacher") ? "text-purple-400 font-semibold" : "text-slate-300"
                }`}
              >
                Teacher Studio
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className={`hover:text-purple-400 transition-colors ${
                  pathname.startsWith("/admin") ? "text-purple-400 font-semibold" : "text-slate-300"
                }`}
              >
                Admin Control
              </Link>
            )}
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500"></span>
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/80 transition-all"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xs ring-2 ring-purple-500/40 uppercase shadow-md">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left pr-1">
                    <span className="text-xs font-semibold text-slate-200 leading-none">{user.name}</span>
                    <span className="text-[10px] text-purple-400 font-medium capitalize mt-0.5">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* User Dropdown */}
                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 glass-panel rounded-2xl shadow-2xl py-2 border border-slate-800 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/40 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm ring-2 ring-purple-500/40 uppercase shadow-md shrink-0">
                          {user.name ? user.name.charAt(0) : "U"}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      {user.role === "student" && (
                        <Link
                          href="/student/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-purple-900/20 hover:text-purple-300"
                        >
                          <GraduationCap className="w-4 h-4 text-purple-400" />
                          Student Dashboard
                        </Link>
                      )}
                      {user.role === "teacher" && (
                        <Link
                          href="/teacher/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-purple-900/20 hover:text-purple-300"
                        >
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          Teacher Dashboard
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-purple-900/20 hover:text-purple-300"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-button"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
