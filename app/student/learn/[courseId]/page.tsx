"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Play,
  CheckCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  Send,
  Award,
  Sparkles,
  Check,
  RotateCcw,
  BookOpen,
  Bot,
  Video,
  MessageSquare,
  Bookmark,
  Flame,
} from "lucide-react";
import { MOCK_COURSES } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AIChatbotDrawer } from "@/components/ai/AIChatbotDrawer";
import { DiscussionForum } from "@/components/forum/DiscussionForum";
import confetti from "canvas-confetti";

export default function UdemyLearningPlayer() {
  const params = useParams();
  const { user } = useAuth();

  const course = MOCK_COURSES.find(
    (c) => c.slug === params.courseId || c._id === params.courseId
  ) || MOCK_COURSES[0];

  const [activeSection, setActiveSection] = useState(course.sections[0]);
  const [activeLesson, setActiveLesson] = useState(course.sections[0]?.lessons[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([course.sections[0]?.lessons[0]?._id || ""]);
  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "assignment" | "forum" | "notes">("overview");

  // AI Chatbot Drawer
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  // Certificate Modal
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const toggleLessonComplete = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
    } else {
      const updated = [...completedLessons, lessonId];
      setCompletedLessons(updated);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }
  };

  const totalLessonsCount = course.totalLessons || 3;
  const progressPercent = Math.round((completedLessons.length / totalLessonsCount) * 100);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col relative">
      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">{course.title}</h1>
            <span className="text-[10px] text-purple-400 font-medium">Instructor: {course.teacher.name}</span>
          </div>
        </div>

        {/* Live Class Launcher & AI Assistant Button */}
        <div className="flex items-center gap-3">
          <a
            href="https://meet.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-1.5"
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Join Live Zoom/Meet</span>
          </a>

          <button
            onClick={() => setShowAiDrawer(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-600/30 flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor</span>
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Get Certificate</span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video Player & Tab Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Main Video Viewport */}
          <div className="relative aspect-video w-full bg-slate-950 border-b border-slate-800/80 flex items-center justify-center">
            {activeLesson?.videoProvider === "youtube" ? (
              <iframe
                src="https://www.youtube-nocookie.com/embed/wm5gMKCOB4U?autoplay=0&modestbranding=1"
                title={activeLesson?.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8">
                <Play className="w-16 h-16 text-purple-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">{activeLesson?.title}</p>
              </div>
            )}
          </div>

          {/* Player Control Bar */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleLessonComplete(activeLesson?._id || "")}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  completedLessons.includes(activeLesson?._id || "")
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{completedLessons.includes(activeLesson?._id || "") ? "Lesson Completed (+50 XP)" : "Mark Complete"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{activeLesson?.title}</span>
            </div>
          </div>

          {/* Interactive Lesson Tabs */}
          <div className="p-6 max-w-4xl space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-xs font-bold pb-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "overview" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Overview & Downloads
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`text-xs font-bold pb-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "quiz" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Interactive Quiz
              </button>
              <button
                onClick={() => setActiveTab("assignment")}
                className={`text-xs font-bold pb-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "assignment" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Assignment
              </button>
              <button
                onClick={() => setActiveTab("forum")}
                className={`text-xs font-bold pb-2 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === "forum" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Q&A Forum
              </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-4 text-xs text-slate-300">
                <h3 className="text-base font-bold text-white">{activeLesson?.title}</h3>
                <p className="leading-relaxed">{activeLesson?.description}</p>
              </div>
            )}

            {/* Q&A FORUM TAB */}
            {activeTab === "forum" && <DiscussionForum />}

            {/* QUIZ TAB */}
            {activeTab === "quiz" && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
                <h3 className="text-base font-bold text-white">Section Comprehension Quiz</h3>
                <p className="text-slate-400">Answer correctly to gain +100 XP!</p>
              </div>
            )}

            {/* ASSIGNMENT TAB */}
            {activeTab === "assignment" && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
                <h3 className="text-base font-bold text-white">Assignment Submission Module</h3>
                <p className="text-slate-400">Submit your project file or repository link.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Curriculum Lesson Tree */}
        <div className="w-full lg:w-80 bg-slate-950 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
            <span>Course Content</span>
            <span className="text-xs font-normal text-slate-400">{course.totalLessons} Lessons</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {course.sections.map((section, sIdx) => (
              <div key={sIdx}>
                <div className="p-3 bg-slate-900/60 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="divide-y divide-slate-900">
                  {section.lessons.map((lesson, lIdx) => {
                    const isCurrent = activeLesson?._id === lesson._id;
                    const isDone = completedLessons.includes(lesson._id || "");
                    return (
                      <button
                        key={lIdx}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                          isCurrent ? "bg-purple-950/40 border-l-2 border-purple-500" : "hover:bg-slate-900/50"
                        }`}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonComplete(lesson._id || "");
                          }}
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border cursor-pointer ${
                            isDone ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 bg-slate-900"
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? "text-purple-300" : "text-slate-200"}`}>
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{lesson.durationMinutes} mins</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Assistant Floating Drawer */}
      <AIChatbotDrawer
        isOpen={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
        lessonTitle={activeLesson?.title || "Current Lesson"}
      />

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-8 rounded-3xl border border-purple-500/40 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Certificate of Completion</h2>
              <p className="text-xs text-slate-400 mt-1">Issued to {user?.name || "Alex Rivera"}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
              <p className="text-slate-400">Course: <span className="font-bold text-white">{course.title}</span></p>
              <p className="text-slate-400">Instructor: <span className="font-bold text-white">{course.teacher.name}</span></p>
              <p className="text-slate-400">Issued On: <span className="font-bold text-white">{new Date().toLocaleDateString()}</span></p>
              <p className="text-slate-400">Verification ID: <span className="font-bold text-purple-400">EDU-CERT-8849201</span></p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert("Exporting PDF Certificate...");
                  setShowCertificateModal(false);
                }}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
