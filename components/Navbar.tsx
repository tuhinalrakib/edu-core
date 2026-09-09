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
  Flame,
  Radio,
  Calendar,
  XCircle,
  Users,
  CheckCheck,
  Trash2,
} from "lucide-react";


export const Navbar: React.FC = () => {

  const { user, token, logout, switchRole, isDemo, clearDemoSession } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const d = JSON.parse(localStorage.getItem("educore_deleted_notifs") || "[]");
        const r = JSON.parse(localStorage.getItem("educore_read_notifs") || "[]");
        return Array.from(new Set([...d, ...r]));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const notifRef = useRef<HTMLDivElement>(null);

  const dismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setDeletedIds((prev) => {
      const updated = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem("educore_deleted_notifs", JSON.stringify(updated));
        localStorage.setItem("educore_read_notifs", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("educore_token") || localStorage.getItem("token")
        : null);

    if (activeToken && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${activeToken}` },
      }).catch(() => {});
    }
  };

  const markAllAsRead = () => {
    const allIds = Array.from(new Set([...deletedIds, ...notifications.map((n) => n.id)]));
    setDeletedIds(allIds);
    setNotifications([]);
    try {
      localStorage.setItem("educore_deleted_notifs", JSON.stringify(allIds));
      localStorage.setItem("educore_read_notifs", JSON.stringify(allIds));
    } catch (e) {}

    const activeToken =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("educore_token") || localStorage.getItem("token")
        : null);

    if (activeToken) {
      fetch(`${API_BASE_URL}/notifications/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${activeToken}` },
      }).catch(() => {});
    }
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
      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("educore_token") || localStorage.getItem("token")
          : null);

      try {
        const headers: any = {};
        if (activeToken) headers.Authorization = `Bearer ${activeToken}`;

        // 1. Fetch Real Database Notifications First
        if (activeToken) {
          try {
            const dbNotifRes = await fetch(`${API_BASE_URL}/notifications?t=${Date.now()}`, {
              headers,
              cache: "no-store",
            });
            const dbNotifData = await dbNotifRes.json();
            if (dbNotifData.success && Array.isArray(dbNotifData.notifications)) {
              dbNotifData.notifications.forEach((dn: any) => {
                // If notification was marked read, seen, or deleted, do NOT display it
                if (dn.isRead || deletedIds.includes(dn._id)) return;

                let notifIcon = Bell;
                let notifColor = "text-purple-400 bg-purple-500/10 border-purple-500/30";
                let notifLink = dn.link || "#";

                if (dn.type === "enrollment_pending") {
                  notifIcon = Clock;
                  notifColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
                  if (user.role === "admin") notifLink = "/admin/dashboard?tab=enrollments";
                  if (user.role === "teacher") notifLink = "/teacher/dashboard?tab=students";
                } else if (dn.type === "enrollment_approved") {
                  notifIcon = CheckCircle;
                  notifColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                  if (user.role === "teacher") notifLink = "/teacher/dashboard?tab=students";
                  if (user.role === "student" && !dn.link) notifLink = "/student/dashboard";
                } else if (dn.type === "enrollment_rejected") {
                  notifIcon = XCircle;
                  notifColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
                  if (user.role === "teacher") notifLink = "/teacher/dashboard?tab=students";
                  if (user.role === "student" && !dn.link) notifLink = "/student/dashboard";
                } else if (dn.type === "course_published") {
                  notifIcon = CheckCircle;
                  notifColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                  notifLink = "/teacher/dashboard";
                }

                notifList.push({
                  id: dn._id,
                  title: dn.title,
                  desc: dn.message,
                  time: dn.createdAt ? new Date(dn.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now",
                  link: notifLink,
                  icon: notifIcon,
                  color: notifColor,
                  isRead: false,
                });
              });
            }
          } catch (dbNotifErr) {
            console.warn("DB notifications fetch fallback:", dbNotifErr);
          }
        }

        // 2. For Admin ONLY: Check if any course is currently awaiting review
        if (user.role === "admin") {
          try {
            const courseRes = await fetch(`${API_BASE_URL}/courses?status=pending&t=${Date.now()}`, {
              cache: "no-store",
              headers,
            });
            const courseData = await courseRes.json();
            if (courseData.success && Array.isArray(courseData.courses)) {
              courseData.courses.forEach((c: any) => {
                const notifId = `pending-course-${c._id || c.id || c.slug}`;
                if (!deletedIds.includes(notifId) && String(c.status).toLowerCase() === "pending") {
                  const teacherName =
                    typeof c.teacher === "object"
                      ? c.teacher?.name || c.teacher?.email || "Instructor"
                      : c.teacher || c.teacherName || "Instructor";

                  notifList.push({
                    id: notifId,
                    title: "New Course Pending Approval ⏳",
                    desc: `"${c.title}" was submitted by ${teacherName} for review.`,
                    time: "Action Required",
                    link: "/admin/dashboard?tab=courses",
                    icon: Clock,
                    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                    isRead: false,
                  });
                }
              });
            }
          } catch (e) {}
        }

        // 3. Check Real-Time Live Classes for instant active alerts
        try {
          const liveRes = await fetch(`${API_BASE_URL}/live-classes/my/classes?t=${Date.now()}`, {
            headers: {
              ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
            },
          });
          const liveData = await liveRes.json();
          if (liveData.success && Array.isArray(liveData.liveClasses)) {
            const activeLive = liveData.liveClasses.filter((l: any) => l.status === "live");
            activeLive.forEach((l: any) => {
              const liveId = `live-alert-${l._id}`;
              if (!deletedIds.includes(liveId)) {
                notifList.unshift({
                  id: liveId,
                  title: "🔴 LIVE CLASS HAPPENING NOW!",
                  desc: `"${l.title}" is live! Click to join interactive video session.`,
                  time: "LIVE NOW",
                  link: `/live/${l._id}`,
                  icon: Radio,
                  color: "text-rose-400 bg-rose-500/20 border-rose-500/50",
                  isRead: false,
                });
              }
            });
          }
        } catch (e) {
          console.warn("Live notification fetch error in Navbar:", e);
        }

      } catch (err) {
        console.warn("Notification fetch fallback:", err);
      }

      setNotifications(notifList);
    };

    fetchNotifications();
    const timer = setInterval(fetchNotifications, 8000);

    const handleSyncEvent = () => {
      fetchNotifications();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleSyncEvent);
      window.addEventListener("educore_new_course", handleSyncEvent);
    }

    return () => {
      clearInterval(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleSyncEvent);
        window.removeEventListener("educore_new_course", handleSyncEvent);
      }
    };
  }, [user, token, pathname]);

  // Automatically reset demo preview when visiting Home page so guest users get clean home screen
  useEffect(() => {
    if (pathname === "/" && isDemo) {
      clearDemoSession();
    }
  }, [pathname, isDemo, clearDemoSession]);

  // Auto-close dropdowns and mobile drawer when navigating to a new route
  useEffect(() => {
    setMobileMenuOpen(false);
    setRoleDropdownOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  const handleRoleSwitch = (role: "student" | "teacher" | "admin") => {
    switchRole(role);
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "teacher") router.push("/teacher/dashboard");
    else router.push("/student/dashboard");
  };

  const unreadCount = notifications.filter((n) => !deletedIds.includes(n.id)).length;

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-button flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Edu<span className="gradient-text">Core</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 tracking-widest font-semibold uppercase -mt-0.5 sm:-mt-1">
                SaaS Learning
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, categories, teachers..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                  router.push(`/courses?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                }
              }}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Navigation Links (Desktop) */}
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
          <div className="flex items-center gap-2 sm:gap-3">
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
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-all cursor-pointer flex items-center gap-1"
                          title="Clear all notifications"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Clear all</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 space-y-1.5">
                          <CheckCircle className="w-8 h-8 text-emerald-400/80 mx-auto" />
                          <p className="text-xs font-bold text-slate-200">All caught up!</p>
                          <p className="text-[11px] text-slate-500">No active notifications right now.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const IconComp = notif.icon || Bell;
                          return (
                            <div
                              key={notif.id}
                              className="p-3 rounded-2xl flex items-start gap-3 transition-colors hover:bg-slate-900/80 group bg-purple-950/20 relative"
                            >
                              <Link
                                href={notif.link || "#"}
                                onClick={() => {
                                  dismissNotification(notif.id);
                                  setNotificationsOpen(false);
                                }}
                                className="flex items-start gap-3 flex-1 min-w-0"
                              >
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${notif.color}`}
                                >
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-bold truncate text-white">
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
                              </Link>

                              {/* Individual dismiss / delete button */}
                              <button
                                onClick={(e) => dismissNotification(notif.id, e)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer"
                                title="Dismiss / Delete notification"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                  className="flex items-center gap-2 p-1 sm:p-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/80 transition-all"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-purple-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xs ring-2 ring-purple-500/40 uppercase shadow-md">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left pr-1">
                    <span className="text-xs font-semibold text-slate-200 leading-none">{user.name}</span>
                    <span className="text-[10px] text-purple-400 font-medium capitalize mt-0.5">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
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
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white gradient-button shadow-md shadow-purple-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-purple-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/90 bg-[#090d16]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses, categories..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                  router.push(`/courses?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                  setMobileMenuOpen(false);
                }
              }}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* User Info Card (when logged in) */}
          {user && (
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm ring-2 ring-purple-500/40 uppercase shrink-0 shadow-md">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {user.role}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/courses"
                  ? "bg-purple-900/30 text-purple-400 font-semibold border border-purple-500/30"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              Explore Courses
            </Link>

            {user?.role === "student" && (
              <Link
                href="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith("/student")
                    ? "bg-purple-900/30 text-purple-400 font-semibold border border-purple-500/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-400" />
                My Learning / Dashboard
              </Link>
            )}

            {user?.role === "teacher" && (
              <Link
                href="/teacher/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith("/teacher")
                    ? "bg-purple-900/30 text-purple-400 font-semibold border border-purple-500/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4 text-blue-400" />
                Teacher Studio
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-purple-900/30 text-purple-400 font-semibold border border-purple-500/30"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Admin Control Console
              </Link>
            )}
          </div>

          {/* Guest / Auth Action Buttons */}
          {!user ? (
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white gradient-button shadow-lg shadow-purple-500/20"
              >
                Get Started Free
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 border border-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

