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
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MOCK_COURSES } from "@/lib/api";
import { TeacherCharts } from "@/components/charts/TeacherCharts";
import Swal from "sweetalert2";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "assignments" | "quizzes"
  >("overview");

  // Courses State initialized with mock or local storage
  const [courses, setCourses] = useState(
    MOCK_COURSES.map((c, idx) => ({
      ...c,
      status: idx === 0 ? "Published" : idx === 1 ? "Draft" : "Published",
      rating: 4.8,
    }))
  );

  // Hydrate created courses from LocalStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
    if (stored.length > 0) {
      setCourses(stored);
    }
  }, []);

  // Student Assignment Submissions State
  const [submissions, setSubmissions] = useState([
    {
      id: "sub-1",
      studentName: "Alex Rivera",
      studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
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
      studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
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
      studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
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

  const handleStatusChange = (courseId: string, newStatus: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c._id === courseId ? { ...c, status: newStatus } : c));
      localStorage.setItem("educore_created_courses", JSON.stringify(updated));
      return updated;
    });
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
    }).then((result) => {
      if (result.isConfirmed) {
        setCourses((prev) => {
          const updated = prev.filter((c) => c._id !== courseId);
          localStorage.setItem("educore_created_courses", JSON.stringify(updated));
          return updated;
        });
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
        <StatCard title="Total Courses" value={courses.length.toString()} icon={BookOpen} change={`${courses.filter(c => c.status === 'Published').length} Published`} gradient="from-emerald-600 to-teal-600" />
        <StatCard title="Revenue" value="$4,520.00" icon={DollarSign} change="18% MoM" gradient="from-blue-600 to-cyan-600" />
        <StatCard title="Pending Assignments" value={pendingSubmissionsCount.toString()} icon={Clock} change={pendingSubmissionsCount > 0 ? "Requires Review" : "All Graded"} gradient="from-amber-600 to-orange-600" />
        <StatCard title="Completion Rate" value="84.5%" icon={CheckCircle} change="+5% vs last month" gradient="from-indigo-600 to-purple-600" />
        <StatCard title="Average Rating" value="4.8 ★" icon={Star} change="450 Reviews" gradient="from-rose-600 to-pink-600" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3 no-scrollbar">
        {[
          { id: "overview", label: "Dashboard Analytics", icon: TrendingUp },
          { id: "courses", label: `Course Management (${courses.length})`, icon: BookOpen },
          {
            id: "assignments",
            label: `Assignment Reviews (${pendingSubmissionsCount})`,
            icon: FileText,
            badge: pendingSubmissionsCount,
          },
          { id: "quizzes", label: "Quizzes Overview", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
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
                    <td className="p-3 font-medium">{course.totalStudents}</td>
                    <td className="p-3 font-bold text-amber-400">{course.rating} ★</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          course.status === "Published"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : course.status === "Draft"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <select
                        value={course.status}
                        onChange={(e) => handleStatusChange(course._id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px] font-semibold"
                      >
                        <option value="Published">Publish</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archive</option>
                      </select>
                      <Link
                        href="/teacher/courses/create"
                        className="p-1.5 text-purple-400 hover:text-purple-300 inline-block"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          sub.status === "Graded"
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
