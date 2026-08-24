"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
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
  CheckCircle,
  Clock,
  ExternalLink,
  Flame,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, switchRole, isDemo, clearDemoSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("educore_read_notifs") || "[]");
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const notifRef = useRef<HTMLDivElement>(null);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem("educore_read_notifs", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]));
    setReadIds(allIds);
    try {
      localStorage.setItem("educore_read_notifs", JSON.stringify(allIds));
    } catch (e) {}
  };


  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch real notification events (like pending courses for Admin / Teacher)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const notifList: any[] = [];

      try {
        const res = await fetch(`${API_BASE_URL}/courses?status=all&t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          if (user.role === "admin") {
            const pendingCourses = data.courses.filter(
              (c: any) => String(c.status).toLowerCase() === "pending"
            );
            pendingCourses.forEach((c: any) => {
              const teacherName =
                typeof c.teacher === "object" ? c.teacher?.name || "Instructor" : c.teacher || "Instructor";
              notifList.push({
                id: `pending-${c._id || c.slug}`,
                title: "Course Pending Approval",
                desc: `"${c.title}" was submitted by ${teacherName} for review.`,
                time: "Action Required",
                link: "/admin/dashboard?tab=courses",
                icon: Clock,
                color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
              });
            });
          } else if (user.role === "teacher") {
            const myCourses = data.courses.filter((c: any) => {
              const tId = typeof c.teacher === "object" ? c.teacher?._id || c.teacher?.id : c.teacher;
              return tId === user.id || tId === (user as any)._id;
            });
            myCourses.forEach((c: any) => {
              const isPub = String(c.status).toLowerCase() === "published";
              notifList.push({
                id: `teacher-course-${c._id || c.slug}`,
                title: isPub ? "Course Live on Platform" : "Course Under Admin Review",
                desc: isPub
                  ? `"${c.title}" is currently published and open for enrollments.`
                  : `"${c.title}" is waiting for admin approval.`,
                time: isPub ? "Active" : "Pending",
                link: "/teacher/dashboard",
                icon: isPub ? CheckCircle : Clock,
                color: isPub
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/30",
              });
            });
          }
        }
      } catch (err) {
        console.warn("Notification fetch fallback:", err);
      }

      // Default system notifications based on role
      if (user.role === "admin") {
        notifList.push({
          id: "sys-admin-welcome",
          title: "System Operations Online",
          desc: "EduCore LMS database and Redis caching are active.",
          time: "Just now",
          link: "/admin/dashboard",
          icon: ShieldAlert,
          color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
        });
      } else if (user.role === "teacher") {
        notifList.push({
          id: "teacher-assignment-sub",
          title: "New Student Assignments",
          desc: "You have 2 student submissions waiting for grading.",
          time: "Today",
          link: "/teacher/dashboard",
          icon: Briefcase,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        });
      } else {
        notifList.push({
          id: "student-streak",
          title: "5 Day Learning Streak Active!",
          desc: "Complete 1 lesson today to keep your XP multiplier.",
          time: "Today",
          link: "/student/dashboard",
          icon: Flame,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        });
      }

      setNotifications(notifList);
    };

    fetchNotifications();
  }, [user, pathname]);

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

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
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
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2 rounded-full transition-all relative ${
                    notificationsOpen
                      ? "bg-purple-900/50 text-purple-300 border border-purple-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse border-2 border-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-3xl shadow-2xl border border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs font-medium">
                          No notifications right now.
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const IconComp = notif.icon || Bell;
                          const isUnread = !readIds.includes(notif.id);
                          return (
                            <Link
                              key={notif.id}
                              href={notif.link || "#"}
                              onClick={() => {
                                markAsRead(notif.id);
                                setNotificationsOpen(false);
                              }}
                              className={`p-3 rounded-2xl flex items-start gap-3 transition-colors hover:bg-slate-900/80 group ${
                                isUnread ? "bg-purple-950/20" : ""
                              }`}
                            >

                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${notif.color}`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p
                                    className={`text-xs font-bold truncate ${
                                      isUnread ? "text-white" : "text-slate-300"
                                    }`}
                                  >
                                    {notif.title}
                                  </p>
                                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                    {notif.time}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.desc}
                                </p>
                              </div>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                              )}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
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
