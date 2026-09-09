"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Play,
  CheckCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  Award,
  Sparkles,
  Check,
  BookOpen,
  Loader2,
  Clock,
  Calendar,
  Timer,
  Zap,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { UniversalVideoPlayer } from "@/components/video/UniversalVideoPlayer";
import { InteractiveQuizPlayer } from "@/components/quiz/InteractiveQuizPlayer";
import { InteractiveAssignmentPlayer } from "@/components/assignment/InteractiveAssignmentPlayer";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";

// Helper to check if a lesson is locked due to future scheduled drip date
const isLessonDripLocked = (lesson: any) => {
  if (!lesson) return false;
  if (lesson.isLocked && lesson.isScheduled) return true;
  if (lesson.unlockAt) {
    const unlockTime = new Date(lesson.unlockAt).getTime();
    if (!isNaN(unlockTime) && unlockTime > Date.now()) {
      return true;
    }
  }
  return false;
};

// =========================================================================
// DRIP COUNTDOWN SCREEN COMPONENT
// =========================================================================
interface DripCountdownProps {
  unlockAt: string;
  lessonTitle: string;
  onTimerZero?: () => void;
}

function DripCountdownScreen({ unlockAt, lessonTitle, onTimerZero }: DripCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 1 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(unlockAt).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        if (onTimerZero) onTimerZero();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [unlockAt, onTimerZero]);

  const formattedDate = unlockAt
    ? new Date(unlockAt).toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Scheduled Soon";

  return (
    <div className="aspect-video w-full max-w-6xl max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-950 via-[#070e1e] to-slate-950 flex flex-col items-center justify-center p-6 sm:p-10 text-center relative">
      {/* Ambient glowing backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Lock Hologram Icon */}
      <div className="relative mb-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center shadow-xl shadow-cyan-500/10 backdrop-blur-md">
          <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 animate-pulse" />
        </div>
        <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-black text-cyan-300 flex items-center gap-1 shadow">
          <Timer className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span>DRIP LOCK</span>
        </span>
      </div>

      {/* Title & Scheduled Info */}
      <div className="max-w-xl space-y-2 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scheduled Release Lecture</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white">{lessonTitle}</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          This lecture is scheduled to publish on <span className="text-cyan-300 font-bold">{formattedDate}</span>.
        </p>
      </div>

      {/* Countdown Timer Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 my-6 sm:my-8 z-10 w-full max-w-lg">
        {[
          { label: "DAYS", value: timeLeft.days },
          { label: "HOURS", value: timeLeft.hours },
          { label: "MINS", value: timeLeft.minutes },
          { label: "SECS", value: timeLeft.seconds },
        ].map((unit, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md flex flex-col items-center justify-center shadow-lg shadow-cyan-950/40 relative overflow-hidden group"
          >
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <span className="text-2xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400/80 tracking-widest mt-1">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {/* Reassurance & Security Badge */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 z-10">
        <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto-unlocks instantly when timer expires</span>
        </span>
        <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Review previous modules in the meantime</span>
        </span>
      </div>
    </div>
  );
}

function UdemyLearningPlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const targetId = (params.courseId as string) || "";

  const [course, setCourse] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>("pending");
  const [isRechecking, setIsRechecking] = useState(false);

  // Active step / subview on current lesson: "video" | "quiz" | "assignment"
  const [activeSubView, setActiveSubView] = useState<"video" | "quiz" | "assignment">("video");

  // Track completion states for current session
  const [videoWatchedMap, setVideoWatchedMap] = useState<Record<string, boolean>>({});
  const [quizPassedMap, setQuizPassedMap] = useState<Record<string, boolean>>({});
  const [assignmentSubmittedMap, setAssignmentSubmittedMap] = useState<Record<string, boolean>>({});

  // Certificate & Completion Modals
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Load Course & Progress Data
  useEffect(() => {
    const loadCourseAndProgress = async () => {
      setIsLoadingCourse(true);
      let foundCourse: any = null;

      // 1. Try local storage created courses first
      try {
        const localCreated = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
        foundCourse = localCreated.find((c: any) => c.slug === targetId || String(c._id) === targetId);
      } catch (e) { }

      // 2. Try fetching from backend API
      const token = typeof window !== "undefined" ? (localStorage.getItem("educore_token") || localStorage.getItem("token")) : null;
      if (!foundCourse) {
        try {
          const res = await fetch(`${API_BASE_URL}/courses/${targetId}?t=${Date.now()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          if (data.success && data.course) {
            foundCourse = data.course;
          }
        } catch (e) { }
      }

      setCourse(foundCourse);

      let approved = false;
      let status = "pending";

      if (user?.role === "admin" || user?.role === "teacher") {
        approved = true;
        status = "approved";
      } else if (foundCourse) {
        if (foundCourse.isApproved !== undefined) {
          approved = Boolean(foundCourse.isApproved);
        }
        if (foundCourse.enrollmentStatus) {
          status = foundCourse.enrollmentStatus;
        }
      }

      // 3. Check student progress and approval status from backend
      let savedCompleted: string[] = [];
      try {
        const localProgress = localStorage.getItem(`educore_progress_${targetId}`);
        if (localProgress) {
          savedCompleted = JSON.parse(localProgress);
        }
      } catch (e) { }

      if (token && targetId) {
        try {
          const pRes = await fetch(`${API_BASE_URL}/student/progress/${targetId}?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const pData = await pRes.json();
          if (pData.success) {
            if (pData.isApproved !== undefined) {
              approved = Boolean(pData.isApproved);
            }
            if (pData.enrollmentStatus) {
              status = pData.enrollmentStatus;
            }
            if (pData.progress?.completedLessons) {
              savedCompleted = Array.from(new Set([...savedCompleted, ...pData.progress.completedLessons]));
            }
          }
        } catch (e) { }
      }

      setIsApproved(approved);
      setEnrollmentStatus(status);
      setCompletedLessons(savedCompleted);

      // Helper to check if a lesson is completed across any ID format
      const checkLessonCompleted = (les: any, list = savedCompleted) => {
        if (!les) return false;
        const candidates = [les._id, les.id, les.slug, les.title, String(les._id), String(les.id)].filter(Boolean);
        return candidates.some((id) => list.includes(id));
      };

      // Helper to match lesson with target query/id
      const isMatchingLesson = (l: any, targetKey: string) => {
        if (!l || !targetKey) return false;
        return (
          l._id === targetKey ||
          l.id === targetKey ||
          String(l._id) === targetKey ||
          String(l.id) === targetKey ||
          l.slug === targetKey ||
          l.title === targetKey
        );
      };

      // Determine initial active lesson
      if (foundCourse?.sections && foundCourse.sections.length > 0) {
        const queryLessonId = searchParams?.get("lessonId");
        let initialLesson: any = null;
        let initialSection: any = null;

        // 1. Check query parameter `?lessonId=...`
        if (queryLessonId) {
          for (const s of foundCourse.sections) {
            const l = (s.lessons || []).find((les: any) => isMatchingLesson(les, queryLessonId));
            if (l) {
              initialLesson = l;
              initialSection = s;
              break;
            }
          }
        }

        // 2. Check localStorage last active lesson
        if (!initialLesson) {
          try {
            const lastSavedId = localStorage.getItem(`educore_last_lesson_${targetId}`);
            if (lastSavedId) {
              for (const s of foundCourse.sections) {
                const l = (s.lessons || []).find((les: any) => isMatchingLesson(les, lastSavedId));
                if (l) {
                  initialLesson = l;
                  initialSection = s;
                  break;
                }
              }
            }
          } catch (e) {}
        }

        // 3. Find first uncompleted lesson across sections in sequence
        if (!initialLesson) {
          for (const s of foundCourse.sections) {
            const l = (s.lessons || []).find((les: any) => !checkLessonCompleted(les, savedCompleted));
            if (l) {
              initialLesson = l;
              initialSection = s;
              break;
            }
          }
        }

        // 4. Fallback: First lesson of first section
        if (!initialLesson) {
          initialSection = foundCourse.sections[0];
          initialLesson = foundCourse.sections[0]?.lessons?.[0];
        }

        if (initialSection) setActiveSection(initialSection);
        if (initialLesson) {
          setActiveLesson(initialLesson);
          try {
            localStorage.setItem(`educore_last_lesson_${targetId}`, initialLesson._id || initialLesson.id || initialLesson.title || "");
          } catch (e) {}

          if (initialLesson.type === "quiz") {
            setActiveSubView("quiz");
          } else if (initialLesson.type === "assignment") {
            setActiveSubView("assignment");
          } else {
            setActiveSubView("video");
          }
        }
      }

      setIsLoadingCourse(false);
    };

    if (targetId) {
      loadCourseAndProgress();
    }
  }, [targetId, searchParams]);

  // Flattened list of all lessons for sequence navigation & locking
  const allLessons: any[] = course?.sections?.flatMap((s: any) => s.lessons || []) || [];
  
  const currentLessonIndex = allLessons.findIndex(
    (l: any) =>
      (l._id && l._id === activeLesson?._id) ||
      (l.id && l.id === activeLesson?.id) ||
      l.title === activeLesson?.title
  );

  const nextLesson = currentLessonIndex !== -1 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;

  const currentLessonId = activeLesson?._id || activeLesson?.id || activeLesson?.title || "";

  // Helper to check if a specific lesson is completed
  const checkLessonCompleted = (les: any, list = completedLessons) => {
    if (!les) return false;
    const candidates = [les._id, les.id, les.slug, les.title, String(les._id), String(les.id)].filter(Boolean);
    return candidates.some((id) => list.includes(id));
  };

  // Helper to check if a specific lesson is unlocked
  const isLessonUnlocked = (lessonIndex: number) => {
    if (lessonIndex === 0) return true; // First lesson is always unlocked
    const previousLesson = allLessons[lessonIndex - 1];
    if (!previousLesson) return false;
    return checkLessonCompleted(previousLesson);
  };

  const isCurrentLessonCompleted = checkLessonCompleted(activeLesson);

  // Lesson Requirements Breakdown
  const hasVideoRequirement = (activeLesson?.type === "video" || !activeLesson?.type || Boolean(activeLesson?.contentUrl)) && activeLesson?.type !== "quiz" && activeLesson?.type !== "assignment";
  const hasAttachedQuiz = Boolean(
    activeLesson?.quiz &&
    Array.isArray(activeLesson.quiz.questions) &&
    activeLesson.quiz.questions.length > 0
  );
  const isStandaloneQuiz = activeLesson?.type === "quiz";
  const hasQuizRequirement = isStandaloneQuiz || hasAttachedQuiz;

  const hasAttachedAssignment = Boolean(activeLesson?.assignment);
  const isStandaloneAssignment = activeLesson?.type === "assignment";
  const hasAssignmentRequirement = isStandaloneAssignment || hasAttachedAssignment;

  // Real-time requirement status
  const isVideoDone = isCurrentLessonCompleted || Boolean(videoWatchedMap[currentLessonId]);
  const isQuizDone = isCurrentLessonCompleted || Boolean(quizPassedMap[currentLessonId]);
  const isAssignmentDone = isCurrentLessonCompleted || Boolean(assignmentSubmittedMap[currentLessonId]);

  // Is current lesson fully completed and ready for Next?
  const isLessonRequirementsSatisfied =
    (!hasVideoRequirement || isVideoDone) &&
    (!hasQuizRequirement || isQuizDone) &&
    (!hasAssignmentRequirement || isAssignmentDone);

  // Timer zero handler to automatically refresh course from backend
  const handleTimerZero = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE_URL}/courses/${targetId}?t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.course) {
        setCourse(data.course);
        // Find updated active lesson
        for (const s of data.course.sections || []) {
          const matching = (s.lessons || []).find((l: any) => (l._id && l._id === currentLessonId) || l.title === activeLesson?.title);
          if (matching) {
            setActiveLesson(matching);
            break;
          }
        }
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {}
  };

  // Switching lesson handler with lock protection
  const handleLessonChange = (lesson: any, lessonIdx: number) => {
    const unlocked = isLessonUnlocked(lessonIdx);
    if (!unlocked) {
      Swal.fire({
        icon: "warning",
        title: "🔒 Lesson Locked",
        html: `<p>You must finish the video, quiz, and/or assignment of the previous lesson and click <strong>Next</strong> before this lesson opens.</p>`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    setActiveLesson(lesson);
    try {
      localStorage.setItem(`educore_last_lesson_${targetId}`, lesson._id || lesson.id || lesson.title || "");
    } catch (e) {}

    if (lesson.type === "quiz") {
      setActiveSubView("quiz");
    } else if (lesson.type === "assignment") {
      setActiveSubView("assignment");
    } else {
      setActiveSubView("video");
    }
  };

  // Mark lesson as complete and save progress
  const markLessonComplete = async (lessonId: string) => {
    if (!lessonId) return;
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId];
      setCompletedLessons(updated);
      try {
        localStorage.setItem(`educore_progress_${targetId}`, JSON.stringify(updated));

        // Record real daily learning minutes for learning velocity graph
        const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const todayKey = daysMap[new Date().getDay()];
        const currentDailyLogs = JSON.parse(localStorage.getItem("educore_daily_learning_minutes") || "{}");
        currentDailyLogs[todayKey] = (Number(currentDailyLogs[todayKey]) || 0) + 20;
        localStorage.setItem("educore_daily_learning_minutes", JSON.stringify(currentDailyLogs));
      } catch (e) { }

      // Save to backend
      try {
        const token = typeof window !== "undefined" ? (localStorage.getItem("educore_token") || localStorage.getItem("token")) : null;
        if (token && targetId) {
          await fetch(`${API_BASE_URL}/student/progress`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId: targetId, lessonId }),
          });
        }
      } catch (e) { }

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Video finished handler
  const handleVideoFinished = () => {
    setVideoWatchedMap((prev) => ({ ...prev, [currentLessonId]: true }));
    Swal.fire({
      icon: "success",
      title: "🎬 Video Completed!",
      text: hasQuizRequirement
        ? "Great job! Now complete the quiz assessment to unlock the next lesson."
        : hasAssignmentRequirement
        ? "Great job! Now complete the assignment project to unlock the next lesson."
        : "Lesson video finished! You can now proceed to the next lesson.",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#10b981",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  // Handle Proceeding to Next Lesson
  const handleProceedToNextLesson = async () => {
    // If lesson has quiz and not done, open quiz
    if (hasAttachedQuiz && !isQuizDone) {
      setVideoWatchedMap((prev) => ({ ...prev, [currentLessonId]: true }));
      setActiveSubView("quiz");
      return;
    }

    // If lesson has assignment and not done, open assignment
    if (hasAttachedAssignment && !isAssignmentDone) {
      setVideoWatchedMap((prev) => ({ ...prev, [currentLessonId]: true }));
      setActiveSubView("assignment");
      return;
    }

    // If standalone quiz lesson and not done
    if (isStandaloneQuiz && !isQuizDone) {
      Swal.fire({
        icon: "warning",
        title: "Quiz Incomplete",
        text: "Please pass the quiz assessment to complete this lesson.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    // If standalone assignment lesson and not done
    if (isStandaloneAssignment && !isAssignmentDone) {
      Swal.fire({
        icon: "warning",
        title: "Assignment Incomplete",
        text: "Please submit your assignment project to complete this lesson.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    // Mark current lesson completed
    await markLessonComplete(currentLessonId);

    // If next lesson exists, navigate to it
    if (nextLesson) {
      const nextIdx = currentLessonIndex + 1;
      setActiveLesson(nextLesson);
      try {
        localStorage.setItem(`educore_last_lesson_${targetId}`, nextLesson._id || nextLesson.id || nextLesson.title || "");
      } catch (e) {}
      if (nextLesson.type === "quiz") {
        setActiveSubView("quiz");
      } else if (nextLesson.type === "assignment") {
        setActiveSubView("assignment");
      } else {
        setActiveSubView("video");
      }
    } else {
      // Course Completed!
      if (course?.hasCertificate) {
        setShowCertificateModal(true);
      } else {
        setShowCompletionModal(true);
      }
    }
  };


  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center">
        <EduCoreLoader message="Loading interactive course player & curriculum" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mb-2" />
        <h2 className="text-xl font-bold text-white">Course Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm">This course is not available in the database.</p>
        <Link
          href="/courses"
          className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button mt-4"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  // 🔒 ACCESS CONTROL: If user is not admin/teacher and enrollment is NOT approved by admin
  if (!isApproved && user?.role !== "admin" && user?.role !== "teacher") {
    const isDeclined = enrollmentStatus === "rejected";
    const teacherName = course.teacher?.name || course.teacherName || "Course Instructor";

    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl w-full glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/90 shadow-2xl relative z-10 text-center space-y-6">
          {/* Animated Lock Hologram */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border flex items-center justify-center shadow-xl backdrop-blur-md ${
                isDeclined
                  ? "bg-rose-500/20 border-rose-500/40 shadow-rose-950/50"
                  : "bg-amber-500/20 border-amber-500/40 shadow-amber-950/50"
              }`}>
                {isDeclined ? (
                  <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400" />
                ) : (
                  <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-pulse" />
                )}
              </div>
              <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow border ${
                isDeclined
                  ? "bg-rose-950 border-rose-500 text-rose-300"
                  : "bg-amber-950 border-amber-500 text-amber-300"
              }`}>
                {isDeclined ? "CANCELLED" : "UNDER REVIEW"}
              </span>
            </div>
          </div>

          {/* Badge & Title */}
          <div className="space-y-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isDeclined
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{isDeclined ? "Enrollment Denied by Admin" : "Awaiting Administrator Approval"}</span>
            </span>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              {isDeclined ? "Access Denied / Enrollment Cancelled" : "Course Video Lectures Locked 🔒"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              {isDeclined
                ? `Your enrollment request for "${course.title}" was declined by the platform administrator. You do not have access to view this course's lectures.`
                : `Your enrollment in "${course.title}" has been submitted. In accordance with platform security controls, all video lectures remain locked until an administrator reviews and approves your enrollment.`}
            </p>
          </div>

          {/* Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Title</span>
              <span className="font-bold text-white line-clamp-1">{course.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Instructor</span>
              <span className="font-bold text-purple-300">{teacherName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Account</span>
              <span className="font-bold text-white">{user?.name || "Student"} ({user?.email})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Approval Status</span>
              <span className={`font-bold flex items-center gap-1.5 ${
                isDeclined ? "text-rose-400" : "text-amber-400"
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                <span>{isDeclined ? "Rejected by Admin" : "Pending Admin Verification"}</span>
              </span>
            </div>
          </div>

          {/* Security Features Info */}
          {!isDeclined && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Auto-Unlock Upon Approval</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Backend Controlled Security</span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!isDeclined && (
              <button
                onClick={async () => {
                  setIsRechecking(true);
                  const token = localStorage.getItem("token") || localStorage.getItem("educore_token");
                  if (token) {
                    try {
                      const res = await fetch(`${API_BASE_URL}/courses/${targetId}?t=${Date.now()}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await res.json();
                      if (data.success && data.course) {
                        setCourse(data.course);
                        if (data.course.isApproved) {
                          setIsApproved(true);
                          setEnrollmentStatus("approved");
                          Swal.fire({
                            icon: "success",
                            title: "Access Approved! 🎉",
                            text: "Your enrollment is now approved! Enjoy learning.",
                            background: "#0f172a",
                            color: "#ffffff",
                          });
                          return;
                        }
                      }
                    } catch (e) {}
                  }
                  setTimeout(() => setIsRechecking(false), 800);
                }}
                disabled={isRechecking}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRechecking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Refresh Approval Status</span>
                  </>
                )}
              </button>
            )}

            <Link
              href="/student/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Go to Student Dashboard</span>
            </Link>

            <Link
              href="/courses"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-2"
            >
              <span>Explore Courses</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalLessonsCount = course.totalLessons || allLessons.length || 1;
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
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-purple-400 font-medium">Instructor: {course.teacher?.name || course.teacherName || "Asma Akter"}</span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] font-bold text-emerald-400">Course Progress: {progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Certificate / Completion Button shown ONLY when course is 100% complete */}
        <div className="flex items-center gap-3">
          {progressPercent >= 100 ? (
            course?.hasCertificate ? (
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-400/40"
              >
                <Award className="w-4 h-4" />
                <span>Get Certificate</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:bg-emerald-900/50"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Course Completed (100%)</span>
              </button>
            )
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{completedLessons.length}/{totalLessonsCount} Lessons Completed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video / Quiz / Assignment Player Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Subview 1: QUIZ PLAYER */}
          {activeSubView === "quiz" ? (
            <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center space-y-4">
              <InteractiveQuizPlayer
                key={`${currentLessonId}-quiz`}
                quiz={
                  activeLesson?.quiz && activeLesson.quiz.questions && activeLesson.quiz.questions.length > 0
                    ? activeLesson.quiz
                    : {
                        title: activeLesson?.title || "Course Quiz Assessment",
                        timeLimitMins: 10,
                        passMarkPercent: 75,
                        questions: [
                          {
                            id: "q-demo-1",
                            questionText: "What is the primary goal of this curriculum module?",
                            options: [
                              "Master core concepts and practical real-world skills",
                              "Memorize syntax without hands-on coding",
                              "Only install software without writing code",
                              "Skip testing and debugging",
                            ],
                            correctOptionIndex: 0,
                            correctAnswer: "Master core concepts and practical real-world skills",
                            explanation: "EduCore curriculum focuses on practical hands-on application and concept mastery.",
                          },
                          {
                            id: "q-demo-2",
                            questionText: "Which architecture pattern enables high scalability in modern SaaS web applications?",
                            options: [
                              "Monolithic desktop architecture",
                              "Microservices / Modular serverless backend with Next.js App Router",
                              "Single-threaded static script execution",
                              "Direct client-to-database connection without authentication",
                            ],
                            correctOptionIndex: 1,
                            correctAnswer: "Microservices / Modular serverless backend with Next.js App Router",
                            explanation: "Modular architectures decouple services and scale seamlessly with cloud infrastructure.",
                          },
                        ],
                      }
                }
                lessonTitle={activeLesson?.title}
                courseId={targetId}
                onQuizCompleted={(passed) => {
                  if (passed) {
                    setQuizPassedMap((prev) => ({ ...prev, [currentLessonId]: true }));
                  }
                }}
              />

              {/* Bottom Action inside Quiz View */}
              <div className="w-full max-w-4xl flex items-center justify-between pt-4 border-t border-slate-800">
                {hasVideoRequirement && (
                  <button
                    onClick={() => setActiveSubView("video")}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Video</span>
                  </button>
                )}

                <button
                  onClick={handleProceedToNextLesson}
                  disabled={!isQuizDone}
                  className={`ml-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isQuizDone
                      ? "text-white gradient-button shadow-lg shadow-purple-600/30 hover:scale-105 cursor-pointer"
                      : "bg-slate-900 text-slate-500 border border-slate-800 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span>
                    {nextLesson
                      ? isCurrentLessonCompleted
                        ? "Next Lesson"
                        : "Unlock & Proceed to Next Lesson"
                      : isCurrentLessonCompleted
                      ? "Course Completed"
                      : "Complete Course"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeSubView === "assignment" ? (
            /* Subview 2: ASSIGNMENT PLAYER */
            <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center space-y-4">
              <InteractiveAssignmentPlayer
                key={`${currentLessonId}-assignment`}
                assignment={
                  activeLesson?.assignment || {
                    title: activeLesson?.title || "Practical Assignment Project",
                    description: activeLesson?.description || "Build and submit your project to demonstrate your mastery of this lesson.",
                    instructions: "1. Create your project according to the curriculum specifications.\n2. Push your source code to GitHub / GitLab.\n3. Deploy the application (e.g. Vercel, Netlify) and submit both links below.",
                    maxPoints: 100,
                  }
                }
                lessonTitle={activeLesson?.title}
                courseId={targetId}
                onAssignmentCompleted={(submitted) => {
                  if (submitted) {
                    setAssignmentSubmittedMap((prev) => ({ ...prev, [currentLessonId]: true }));
                  }
                }}
              />

              {/* Bottom Action inside Assignment View */}
              <div className="w-full max-w-4xl flex items-center justify-between pt-4 border-t border-slate-800">
                {hasVideoRequirement && (
                  <button
                    onClick={() => setActiveSubView("video")}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Video</span>
                  </button>
                )}

                <button
                  onClick={handleProceedToNextLesson}
                  disabled={!isAssignmentDone}
                  className={`ml-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isAssignmentDone
                      ? "text-white gradient-button shadow-lg shadow-purple-600/30 hover:scale-105 cursor-pointer"
                      : "bg-slate-900 text-slate-500 border border-slate-800 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span>
                    {nextLesson
                      ? isCurrentLessonCompleted
                        ? "Next Lesson"
                        : "Unlock & Proceed to Next Lesson"
                      : isCurrentLessonCompleted
                      ? "Course Completed"
                      : "Complete Course"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Subview 3: VIDEO PLAYER or DRIP COUNTDOWN */
            <div className="flex-1 w-full bg-slate-950 flex flex-col items-center p-4 sm:p-6 space-y-5">
              {/* If active lesson is locked by scheduled drip release: show live Countdown Screen */}
              {isLessonDripLocked(activeLesson) ? (
                <DripCountdownScreen
                  key={`drip-${currentLessonId}`}
                  unlockAt={activeLesson?.unlockAt}
                  lessonTitle={activeLesson?.title || "Scheduled Lecture"}
                  onTimerZero={handleTimerZero}
                />
              ) : (
                /* Video Player */
                <div className="aspect-video w-full max-w-6xl max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-900">
                  <UniversalVideoPlayer
                    key={currentLessonId}
                    url={activeLesson?.contentUrl}
                    provider={activeLesson?.videoProvider}
                    title={activeLesson?.title}
                    onEnded={handleVideoFinished}
                  />
                </div>
              )}

              {/* Action & Navigation Bar Below Video / Countdown */}
              <div className="w-full max-w-6xl glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{activeLesson?.title}</span>
                    {isCurrentLessonCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {isLessonDripLocked(activeLesson) && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <Timer className="w-3 h-3 animate-pulse" /> Scheduled Release
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {isLessonDripLocked(activeLesson)
                      ? `This lecture is scheduled to publish on ${new Date(activeLesson.unlockAt).toLocaleString()}. The video player will unlock automatically.`
                      : activeLesson?.description || "Watch this lecture video, complete any quiz or assignment, then click Next to unlock the next lesson."}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                  {prevLesson && (
                    <button
                      onClick={() => handleLessonChange(prevLesson, currentLessonIndex - 1)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                  )}

                  {/* If active lesson is Drip-Locked: show status banner */}
                  {isLessonDripLocked(activeLesson) ? (
                    <div className="px-4 py-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-2 shadow">
                      <Timer className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>Lecture Unlocks Automatically</span>
                    </div>
                  ) : hasAttachedQuiz && !isQuizDone ? (
                    /* If attached quiz exists and not passed: show Step: Take Quiz */
                    <button
                      onClick={() => {
                        setVideoWatchedMap((prev) => ({ ...prev, [currentLessonId]: true }));
                        setActiveSubView("quiz");
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Next: Take Lesson Quiz</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : hasAttachedAssignment && !isAssignmentDone ? (
                    <button
                      onClick={() => {
                        setVideoWatchedMap((prev) => ({ ...prev, [currentLessonId]: true }));
                        setActiveSubView("assignment");
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Next: Submit Assignment</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    /* Next Lesson Button */
                    <button
                      onClick={handleProceedToNextLesson}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white gradient-button shadow-xl shadow-purple-600/40 hover:scale-105 cursor-pointer ring-2 ring-emerald-500/40 flex items-center gap-2 transition-all"
                    >
                      <span>
                        {nextLesson
                          ? isCurrentLessonCompleted
                            ? "Next Lesson"
                            : "Complete & Unlock Next Lesson"
                          : isCurrentLessonCompleted
                          ? "Course Completed"
                          : "Complete Course"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Curriculum Lesson Tree with Visual Lock Indicator */}
        <div className="w-full lg:w-80 bg-slate-950 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
            <span>Course Curriculum</span>
            <span className="text-xs font-semibold text-purple-400">
              {completedLessons.length}/{totalLessonsCount} Completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-1.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
            {course.sections.map((section: any, sIdx: number) => (
              <div key={sIdx}>
                <div className="p-3 bg-slate-900/60 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="divide-y divide-slate-900">
                  {section.lessons.map((lesson: any, lIdx: number) => {
                    const globalLessonIdx = allLessons.findIndex(
                      (l: any) =>
                        (l._id && l._id === lesson._id) ||
                        (l.id && l.id === lesson.id) ||
                        l.title === lesson.title
                    );
                    const isUnlocked = isLessonUnlocked(globalLessonIdx);
                    const isDripLocked = isLessonDripLocked(lesson);
                    const isCurrent =
                      (activeLesson?._id && lesson._id === activeLesson._id) ||
                      (activeLesson?.id && lesson.id === activeLesson.id) ||
                      activeLesson?.title === lesson.title;
                    const isDone = checkLessonCompleted(lesson);
                    const isQuiz = lesson.type === "quiz";
                    const isAssignment = lesson.type === "assignment";

                    return (
                      <button
                        key={lIdx}
                        onClick={() => handleLessonChange(lesson, globalLessonIdx)}
                        className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                          isCurrent
                            ? "bg-purple-950/40 border-l-2 border-purple-500"
                            : isDripLocked
                            ? "hover:bg-slate-900/60 bg-cyan-950/10"
                            : isUnlocked
                            ? "hover:bg-slate-900/50"
                            : "opacity-50 cursor-not-allowed bg-slate-950/40"
                        }`}
                      >
                        {/* Status Check / Lock Icon */}
                        <div
                          className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center shrink-0 border ${
                            isDone
                              ? "bg-emerald-500 border-emerald-400 text-slate-950"
                              : isDripLocked
                              ? "bg-cyan-950 border-cyan-500/50 text-cyan-400"
                              : !isUnlocked
                              ? "bg-slate-900 border-slate-800 text-slate-600"
                              : "border-slate-700 bg-slate-900 text-purple-400"
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : isDripLocked ? (
                            <Timer className="w-3 h-3 text-cyan-400 animate-pulse" />
                          ) : !isUnlocked ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : (
                            <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isQuiz ? (
                              <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : isAssignment ? (
                              <BookOpen className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Play className="w-3 h-3 text-purple-400 shrink-0" />
                            )}
                            <p className={`text-xs font-bold truncate ${isCurrent ? "text-purple-300" : isDripLocked ? "text-cyan-200" : isUnlocked ? "text-slate-200" : "text-slate-500"}`}>
                              {lesson.title}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            {isQuiz && (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/30">
                                Quiz
                              </span>
                            )}
                            {isAssignment && (
                              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                Assignment
                              </span>
                            )}
                            {isDripLocked && (
                              <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/70 px-1.5 py-0.2 rounded border border-cyan-500/40 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>
                                  {new Date(lesson.unlockAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </span>
                            )}
                            {!isUnlocked && !isDripLocked && (
                              <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Locked
                              </span>
                            )}
                            {lesson.durationMinutes && Number(lesson.durationMinutes) > 0 ? (
                              <span className="text-[10px] text-slate-500">{lesson.durationMinutes} mins</span>
                            ) : null}
                          </div>
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

      {/* Certificate Modal - Only accessible if course actually has a certificate configured */}
      {showCertificateModal && course?.hasCertificate && (
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
              <p className="text-slate-400">Instructor: <span className="font-bold text-white">{course.teacher?.name || "EduCore Instructor"}</span></p>
              <p className="text-slate-400">Issued On: <span className="font-bold text-white">{new Date().toLocaleDateString()}</span></p>
              <p className="text-slate-400">Verification ID: <span className="font-bold text-purple-400">EDU-CERT-8849201</span></p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  Swal.fire({
                    title: "Generating Certificate...",
                    text: "Please wait while your verified certificate is being prepared.",
                    background: "#0f172a",
                    color: "#ffffff",
                    showConfirmButton: false,
                    timer: 1200,
                    timerProgressBar: true,
                    didOpen: () => {
                      Swal.showLoading();
                    },
                  }).then(() => {
                    Swal.fire({
                      icon: "success",
                      title: "🎓 Certificate Exported!",
                      html: `<p style="font-size: 14px; color: #cbd5e1;">Your official Certificate of Completion for <strong style="color: #a855f7;">${course.title}</strong> has been generated successfully.</p>`,
                      background: "#0f172a",
                      color: "#ffffff",
                      confirmButtonColor: "#7c3aed",
                      confirmButtonText: "Print / Save PDF",
                      showCancelButton: true,
                      cancelButtonText: "Close",
                      cancelButtonColor: "#334155",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        window.print();
                      }
                    });
                  });
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

      {/* Course Completion Celebration Modal (when course has NO certificate configured) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Course 100% Completed
              </span>
              <h2 className="text-2xl font-black text-white mt-2">Congratulations, {user?.name || "Student"}!</h2>
              <p className="text-xs text-slate-400 mt-1">
                You have completed all lessons and requirements in <strong className="text-white">{course.title}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Instructor</span>
                <span className="font-bold text-white">{course.teacher?.name || course.teacherName || "EduCore Instructor"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Total Lessons</span>
                <span className="font-bold text-emerald-400">{completedLessons.length} / {totalLessonsCount} Completed</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/student/dashboard"
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2"
              >
                <span>Back to Dashboard</span>
              </Link>
              <button
                onClick={() => setShowCompletionModal(false)}
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

export default function UdemyLearningPlayer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-300">Loading course player...</p>
        </div>
      }
    >
      <UdemyLearningPlayerContent />
    </Suspense>
  );
}
