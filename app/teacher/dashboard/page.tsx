"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  DollarSign,
  Plus,
  Star,
  CheckCircle,
  FileText,
  TrendingUp,
  Clock,
  Award,
  Edit,
  Trash2,
  Eye,
  Archive,
  Send,
  ExternalLink,
  HelpCircle,
  Search,
  Filter,
  X,
  Check,
  Loader2,
  User,
  Camera,
  Shield,
  Save,
  Key,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { API_BASE_URL } from "@/lib/api";
import { TeacherCharts } from "@/components/charts/TeacherCharts";
import { useAuth } from "@/context/AuthContext";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import Swal from "sweetalert2";

export default function TeacherDashboard() {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "assignments" | "quizzes" | "profile"
  >("overview");

  // Teacher Profile State
  const [profileName, setProfileName] = useState(user?.name || "Asma Akter");
  const [profileTitle, setProfileTitle] = useState(user?.title || "Senior Full-Stack Instructor & Educator");
  const [profileEmail, setProfileEmail] = useState(user?.email || "asmaulhosna77901@gmail.com");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+880 1700-000000");
  const [profileBio, setProfileBio] = useState(
    user?.bio || "Experienced instructor teaching modern web development, TypeScript, React, and cloud applications on EduCore LMS."
  );
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.title) setProfileTitle(user.title);
      if (user.email) setProfileEmail(user.email);
      if (user.phone) setProfilePhone(user.phone);
      if (user.bio) setProfileBio(user.bio);
      if (user.avatar) setProfileAvatar(user.avatar);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "educore/avatars");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProfileAvatar(data.url);
        updateUser({ avatar: data.url });
        Swal.fire({
          icon: "success",
          title: "Avatar Uploaded!",
          text: "Profile photo updated successfully.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          timer: 1500,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Failed to upload avatar image.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password Too Short",
        text: "New password must be at least 6 characters.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure your new password and confirmation match.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: profileName,
          title: profileTitle,
          bio: profileBio,
          phone: profilePhone,
          avatar: profileAvatar,
          password: newPassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();

      updateUser({
        name: profileName,
        title: profileTitle,
        bio: profileBio,
        phone: profilePhone,
        avatar: profileAvatar,
      });

      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: "success",
        title: "Profile Updated! 🎉",
        text: "Your teacher profile and details have been successfully saved.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } catch (err: any) {
      updateUser({
        name: profileName,
        title: profileTitle,
        bio: profileBio,
        phone: profilePhone,
        avatar: profileAvatar,
      });
      Swal.fire({
        icon: "success",
        title: "Profile Saved!",
        text: "Profile saved locally.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Courses State fetched dynamically from DB
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Hydrate courses from MongoDB Database API
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const res = await fetch(`${API_BASE_URL}/courses?status=all&t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          // If teacher is logged in, show all courses or teacher's courses
          setCourses(data.courses);
          return;
        }
        const stored = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        if (stored.length > 0) setCourses(stored);
      } catch (err) {
        console.warn("Backend fetch teacher courses fallback:", err);
        const stored = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        if (stored.length > 0) setCourses(stored);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchTeacherCourses();
  }, [user]);

  // Student Assignment Submissions State
  const [submissions, setSubmissions] = useState([
    {
      id: "sub-1",
      studentName: "Alex Rivera",
      studentAvatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=7c3aed&color=fff&bold=true",
      courseTitle: "Next.js 15 & React 19 Full-Stack SaaS Masterclass",
      assignmentTitle: "Build a Full-Stack E-Commerce API with Express",
      fileType: "ZIP Archive",
      fileUrl: "https://github.com/alexrivera/express-ecommerce-api.zip",
      linkType: "GitHub / ZIP",
      submittedDate: "2026-07-27 02:30 PM",
      status: "Pending Review",
      marks: null as number | null,
      feedback: "",
    },
    {
      id: "sub-2",
      studentName: "Jessica Chen",
      studentAvatar: "https://ui-avatars.com/api/?name=Jessica+Chen&background=2563eb&color=fff&bold=true",
      courseTitle: "UI/UX Design Masterclass 2026",
      assignmentTitle: "Figma Mobile App Wireframe & Prototyping",
      fileType: "Figma Link",
      fileUrl: "https://figma.com/file/sample-wireframe-prototype",
      linkType: "Google Drive / Figma",
      submittedDate: "2026-07-26 11:15 AM",
      status: "Pending Review",
      marks: null as number | null,
      feedback: "",
    },
    {
      id: "sub-3",
      studentName: "Marcus Vance",
      studentAvatar: "https://ui-avatars.com/api/?name=Marcus+Vance&background=059669&color=fff&bold=true",
      courseTitle: "Next.js 15 & React 19 Full-Stack SaaS Masterclass",
      assignmentTitle: "Build a Full-Stack E-Commerce API with Express",
      fileType: "PDF Document",
      fileUrl: "https://educore.com/docs/marcus-assignment.pdf",
      linkType: "PDF",
      submittedDate: "2026-07-25 09:40 AM",
      status: "Graded",
      marks: 95,
      feedback: "Outstanding API architecture and clean TypeScript code structure!",
    },
  ]);

  // Selected Submission for Review Modal
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [givenMarks, setGivenMarks] = useState<number | "">("");
  const [givenFeedback, setGivenFeedback] = useState("");

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c._id === courseId ? { ...c, status: newStatus } : c));
      localStorage.setItem("educore_created_courses", JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/courses/${courseId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn("Backend status update failed:", err);
    }

    Swal.fire({
      icon: "success",
      title: `Course Status Updated`,
      text: `Course marked as ${newStatus.toUpperCase()}`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
      timer: 1500,
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    Swal.fire({
      icon: "warning",
      title: "Delete Course?",
      text: "Are you sure you want to delete this course from your instructor studio?",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCourses((prev) => {
          const updated = prev.filter((c) => c._id !== courseId);
          localStorage.setItem("educore_created_courses", JSON.stringify(updated));
          return updated;
        });

        try {
          await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.warn("Backend delete course failed:", err);
        }

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Course removed.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
        });
      }
    });
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || givenMarks === "") return;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id
          ? {
            ...s,
            status: "Graded",
            marks: Number(givenMarks),
            feedback: givenFeedback,
          }
          : s
      )
    );

    Swal.fire({
      icon: "success",
      title: "Assignment Graded! 🎓",
      text: `Grade of ${givenMarks}/100 and feedback sent to ${selectedSub.studentName}.`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
    });

    setSelectedSub(null);
    setGivenMarks("");
    setGivenFeedback("");
  };

  const pendingSubmissionsCount = submissions.filter(
    (s) => s.status === "Pending Review"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Instructor Command Center
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Teacher Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build interactive courses, grade student assignments, create quizzes, and monitor revenue analytics.
          </p>
        </div>

        <Link
          href="/teacher/courses/create"
          className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* 6 Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Students" value="2,310" icon={Users} change="12% MoM" gradient="from-purple-600 to-indigo-600" />
        <StatCard
          title="Total Courses"
          value={isLoadingCourses ? "..." : courses.length.toString()}
          icon={BookOpen}
          change={isLoadingCourses ? "Loading..." : `${courses.filter((c) => c.status === "Published" || c.status === "published").length} Published`}
          gradient="from-emerald-600 to-teal-600"
        />
        <StatCard title="Revenue" value="$4,520.00" icon={DollarSign} change="18% MoM" gradient="from-blue-600 to-cyan-600" />
        <StatCard title="Pending Assignments" value={pendingSubmissionsCount.toString()} icon={Clock} change={pendingSubmissionsCount > 0 ? "Requires Review" : "All Graded"} gradient="from-amber-600 to-orange-600" />
        <StatCard title="Completion Rate" value="84.5%" icon={CheckCircle} change="+5% vs last month" gradient="from-indigo-600 to-purple-600" />
        <StatCard title="Average Rating" value="4.8 ★" icon={Star} change="450 Reviews" gradient="from-rose-600 to-pink-600" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3 no-scrollbar">
        {[
          { id: "overview", label: "Dashboard Analytics", icon: TrendingUp },
          { id: "courses", label: isLoadingCourses ? "Course Management (Loading...)" : `Course Management (${courses.length})`, icon: BookOpen },
          {
            id: "assignments",
            label: `Assignment Reviews (${pendingSubmissionsCount})`,
            icon: FileText,
            badge: pendingSubmissionsCount,
          },
          { id: "quizzes", label: "Quizzes Overview", icon: HelpCircle },
          { id: "profile", label: "Instructor Profile & Settings", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${isActive
                  ? "bg-purple-900/50 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <TeacherCharts />
        </div>
      )}

      {/* TAB 2: COURSE MANAGEMENT */}
      {activeTab === "courses" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your Courses</h2>
              <p className="text-xs text-slate-400">Publish, draft, archive, or manage your curriculum content.</p>
            </div>
            <Link
              href="/teacher/courses/create"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </Link>
          </div>

          {isLoadingCourses ? (
            <div className="py-12 border border-slate-800/60 rounded-2xl bg-slate-950/40">
              <EduCoreLoader message="Loading instructor courses from database" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 border border-slate-800/60 rounded-2xl bg-slate-950/40 text-center p-6">
              <BookOpen className="w-10 h-10 text-slate-600 mb-1" />
              <h3 className="text-sm font-bold text-white">No courses created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Get started by creating your first course using the &quot;Add New Course&quot; button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Students</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-white flex items-center gap-3">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-12 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-8 rounded bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-[11px] font-bold text-purple-300 shrink-0">
                            {course.title ? course.title.charAt(0) : "C"}
                          </div>
                        )}
                        <span className="truncate max-w-xs">{course.title}</span>
                      </td>
                      <td className="p-3">{course.category}</td>
                      <td className="p-3 font-bold text-emerald-400">${course.price}</td>
                      <td className="p-3 font-medium">{course.totalStudents || 0}</td>
                      <td className="p-3 font-bold text-amber-400">{course.rating || "5.0"} ★</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${course.status === "Published"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : course.status === "Draft"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={course.status}
                            onChange={(e) => handleStatusChange(course._id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-[11px] font-semibold focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
                          >
                            <option value="Published">Publish</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archive</option>
                          </select>
                          <Link
                            href={`/student/learn/${course.slug || course._id}`}
                            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex items-center justify-center shadow-sm"
                            title="Preview Course Player"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/teacher/courses/create?id=${course._id}`}
                            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all flex items-center justify-center shadow-sm"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center shadow-sm"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS REVIEW & GRADING */}
      {activeTab === "assignments" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Student Assignment Submissions</span>
                {pendingSubmissionsCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingSubmissionsCount} Pending Review
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Review student PDF, ZIP, and Google Drive submissions, assign marks, and send feedback.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Assignment Title</th>
                  <th className="p-3">Submission File / Link</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-white flex items-center gap-2.5">
                      <img src={sub.studentAvatar} className="w-8 h-8 rounded-full object-cover border border-purple-500/40" />
                      <div>
                        <p>{sub.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{sub.courseTitle}</p>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{sub.assignmentTitle}</td>
                    <td className="p-3">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-purple-400 hover:underline font-bold text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{sub.fileType}</span>
                      </a>
                    </td>
                    <td className="p-3 text-slate-400">{sub.submittedDate}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sub.status === "Graded"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {sub.marks !== null ? (
                        <span className="text-emerald-400">{sub.marks} / 100</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setGivenMarks(sub.marks !== null ? sub.marks : "");
                          setGivenFeedback(sub.feedback || "");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow-md"
                      >
                        {sub.status === "Graded" ? "Edit Grade" : "Review & Grade"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: QUIZZES OVERVIEW */}
      {activeTab === "quizzes" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Course Quizzes & Assessments</h2>
              <p className="text-xs text-slate-400">Configure quiz pass marks, time limits, MCQ questions, and auto-grading.</p>
            </div>
            <Link
              href="/teacher/courses/create"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300">
                    Next.js Masterclass
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Quiz 1: React Server Components & App Router</h4>
                </div>
                <span className="text-xs font-bold text-emerald-400">Pass Mark: 80%</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⏱️ Time Limit: 15 mins</span>
                <span>❓ 10 MCQ Questions</span>
                <span>⭐ Randomize: Enabled</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300">
                    UI/UX Design
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">Quiz 2: Figma Design System & Wireframing</h4>
                </div>
                <span className="text-xs font-bold text-emerald-400">Pass Mark: 75%</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>⏱️ Time Limit: 20 mins</span>
                <span>❓ 12 Questions (MCQ & True/False)</span>
                <span>⭐ Randomize: Enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INSTRUCTOR PROFILE & SETTINGS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Avatar & Profile Card Preview */}
          <div className="lg:col-span-1 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 text-center">
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-500/40 shadow-2xl bg-purple-900/30 mx-auto flex items-center justify-center">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-button flex items-center justify-center text-3xl font-black text-white">
                    {profileName ? profileName.slice(0, 2).toUpperCase() : "AA"}
                  </div>
                )}
              </div>
              <label
                htmlFor="teacher-avatar-file"
                className="absolute bottom-0 right-0 p-2.5 rounded-full gradient-button text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                title="Change Photo"
              >
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input
                  id="teacher-avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[11px] font-bold mb-2">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Educator</span>
              </div>
              <h3 className="text-xl font-black text-white">{profileName}</h3>
              <p className="text-xs text-purple-400 font-medium mt-0.5">{profileTitle}</p>
              <p className="text-xs text-slate-400 mt-1">{profileEmail}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Instructor Bio</span>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                {profileBio || "No bio added yet. Write your background and experience to help students learn about you."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-lg font-black text-white">{courses.length}</span>
                <p className="text-[10px] text-slate-400">Total Courses</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-lg font-black text-amber-400">4.8 ★</span>
                <p className="text-[10px] text-slate-400">Instructor Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile & Security Form */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                <span>Teacher Profile & Account Settings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize how your name, credentials, and bio appear across all your courses and to your students.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
                  General Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Asma Akter"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>Professional Title / Designation</span>
                    </label>
                    <input
                      type="text"
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Instructor & Lead Developer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileEmail}
                      className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone / Contact Number</span>
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. +880 1700-000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>Avatar Image URL (or upload via camera button)</span>
                  </label>
                  <input
                    type="url"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Section 2: Biography */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>About Instructor / Biography</span>
                </label>
                <textarea
                  rows={4}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Share your expertise, achievements, industry experience, and what students will learn from your courses..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                />
                <p className="text-[11px] text-slate-500">
                  This biography will appear on the course landing pages and instructor profile cards for your students.
                </p>
              </div>

              {/* Section 3: Security / Password */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Change Password (Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGNMENT REVIEW & GRADING */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Review & Grade Assignment</h3>
              <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <img src={selectedSub.studentAvatar} className="w-12 h-12 rounded-full object-cover border border-purple-500/40" />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedSub.studentName}</h4>
                <p className="text-xs text-purple-400 font-medium">{selectedSub.courseTitle}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">Assignment Title:</p>
              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">{selectedSub.assignmentTitle}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">Student Submission Link / Attachment:</p>
              <a
                href={selectedSub.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-purple-300 font-bold bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl hover:bg-purple-900/40 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-purple-400" />
                <span>Open Submission File ({selectedSub.linkType})</span>
              </a>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Marks (Out of 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={givenMarks}
                  onChange={(e) => setGivenMarks(Number(e.target.value))}
                  required
                  placeholder="e.g. 95"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teacher Feedback & Comments</label>
                <textarea
                  rows={3}
                  value={givenFeedback}
                  onChange={(e) => setGivenFeedback(e.target.value)}
                  placeholder="Write constructive feedback for the student..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Return Graded Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
