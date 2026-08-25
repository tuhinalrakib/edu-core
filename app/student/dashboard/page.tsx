"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Play,
  Award,
  Flame,
  Clock,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Loader2,
  GraduationCap,
  FileText,
  HelpCircle,
  Sparkles,
  BarChart3,
  Check,
  Star,
  Download,
  Share2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Radio,
  Video,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, CourseType } from "@/lib/api";
import { StudentCharts } from "@/components/charts/StudentCharts";
import { GamificationWidget } from "@/components/gamification/GamificationWidget";
import { EduCoreLoader } from "@/components/EduCoreLoader";

// Calculate Letter Grade and CGPA on Standard 4.00 Scale from Percentage / Marks
function calculateGradeAndGPA(percentage: number) {
  if (percentage >= 80) return { grade: "A+", gpa: 4.00, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  if (percentage >= 75) return { grade: "A", gpa: 3.75, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
  if (percentage >= 70) return { grade: "A-", gpa: 3.50, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
  if (percentage >= 65) return { grade: "B+", gpa: 3.25, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
  if (percentage >= 60) return { grade: "B", gpa: 3.00, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  if (percentage >= 55) return { grade: "B-", gpa: 2.75, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
  if (percentage >= 50) return { grade: "C+", gpa: 2.50, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
  if (percentage >= 45) return { grade: "C", gpa: 2.25, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  if (percentage >= 40) return { grade: "D", gpa: 2.00, color: "text-rose-500 bg-rose-500/10 border-rose-500/30" };
  return { grade: "F", gpa: 0.00, color: "text-red-500 bg-red-500/10 border-red-500/30" };
}


function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "liveClasses" | "grades" | "quizzes" | "assignments" | "certificates">(
    tabParam && ["courses", "liveClasses", "grades", "quizzes", "assignments", "certificates"].includes(tabParam)
      ? (tabParam as any)
      : "courses"
  );

  // Sync tab with URL search parameter
  useEffect(() => {
    if (
      tabParam &&
      ["courses", "liveClasses", "grades", "quizzes", "assignments", "certificates"].includes(tabParam)
    ) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "courses" | "liveClasses" | "grades" | "quizzes" | "assignments" | "certificates") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Load Real Courses, Progress, Quizzes & Assignments from Backend & Storage
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const activeToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("educore_token") || localStorage.getItem("token")
          : null);


      try {
        // 1. Fetch Courses
        const courseRes = await fetch(`${API_BASE_URL}/courses`);
        const courseData = await courseRes.json();
        const loadedCourses: CourseType[] = courseData.success && Array.isArray(courseData.courses)
          ? courseData.courses
          : [];
        setCourses(loadedCourses);

        // 2. Fetch Completed Lessons Progress Map
        const progressMap: Record<string, string[]> = {};
        loadedCourses.forEach((c) => {
          const key = c.slug || c._id;
          try {
            const stored = localStorage.getItem(`educore_progress_${key}`);
            if (stored) {
              progressMap[key] = JSON.parse(stored);
            }
          } catch (e) {}
        });

        if (token) {
          try {
            const pRes = await fetch(`${API_BASE_URL}/student/courses`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const pData = await pRes.json();
            if (pData.success && Array.isArray(pData.progressList)) {
              pData.progressList.forEach((item: any) => {
                const cId = item.course?._id || item.course?.slug || item.course;
                if (cId) {
                  progressMap[cId] = Array.from(
                    new Set([...(progressMap[cId] || []), ...(item.completedLessons || [])])
                  );
                }
              });
            }
          } catch (e) {}
        }
        setUserProgressMap(progressMap);

        // 3. Fetch Real Quiz Submissions
        let allQuizzes: any[] = [];
        loadedCourses.forEach((c) => {
          const key = c.slug || c._id;
          try {
            const stored = localStorage.getItem(`educore_quiz_submissions_${key}`);
            if (stored) {
              allQuizzes = [...allQuizzes, ...JSON.parse(stored)];
            }
          } catch (e) {}
        });

        if (token) {
          try {
            const qRes = await fetch(`${API_BASE_URL}/quizzes/my-submissions`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const qData = await qRes.json();
            if (qData.success && Array.isArray(qData.submissions)) {
              allQuizzes = [...allQuizzes, ...qData.submissions];
            }
          } catch (e) {}
        }
        setQuizSubmissions(allQuizzes);

        // 4. Fetch Real Assignment Submissions
        let allAssignments: any[] = [];
        if (token) {
          try {
            const aRes = await fetch(`${API_BASE_URL}/assignments/my-submissions`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const aData = await aRes.json();
            if (aData.success && Array.isArray(aData.submissions)) {
              allAssignments = aData.submissions;
            }
          } catch (e) {}
        }
        setAssignmentSubmissions(allAssignments);

        // 5. Fetch Live Classes for Student
        try {
          const liveRes = await fetch(`${API_BASE_URL}/live-classes/my/classes?t=${Date.now()}`, {
            headers: {
              ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
            },
          });
          const liveData = await liveRes.json();
          if (liveData.success && Array.isArray(liveData.liveClasses)) {
            setLiveClasses(liveData.liveClasses);
          }
        } catch (e) {
          console.warn("Live classes fetch error:", e);
        }

      } catch (err) {
        console.error("Failed to load student dashboard data:", err);
      } finally {
        setIsLoading(false);
      }


    };

    fetchDashboardData();
  }, []);

  // Compute Enrolled courses data with 100% REAL dynamic metrics
  const enrolledCoursesData = courses.map((course) => {
    const sections = Array.isArray(course.sections) ? course.sections : [];
    const allLessons: any[] = [];
    sections.forEach((sec) => {
      if (Array.isArray(sec.lessons)) {
        sec.lessons.forEach((l) => allLessons.push({ ...l, sectionTitle: sec.title }));
      }
    });

    const totalLessons = allLessons.length || course.totalLessons || 1;
    const courseKey = course.slug || course._id;
    const storedCompleted: string[] = userProgressMap[courseKey] || [];
    const completedLessonsCount = storedCompleted.length;
    const progressPercentage = Math.min(100, Math.round((completedLessonsCount / Math.max(1, totalLessons)) * 100));
    const isCompleted = progressPercentage >= 100;

    // Find current active lecture to resume (check saved last active lesson, or first uncompleted lesson)
    let currentActiveLesson: any = null;
    try {
      const savedLastId = localStorage.getItem(`educore_last_lesson_${courseKey}`);
      if (savedLastId) {
        currentActiveLesson = allLessons.find(
          (l) => l._id === savedLastId || l.id === savedLastId || String(l._id) === savedLastId || l.title === savedLastId
        );
      }
    } catch (e) {}

    if (!currentActiveLesson) {
      currentActiveLesson = allLessons.find((l) => {
        const ids = [l._id, l.id, l.slug, l.title, String(l._id), String(l.id)].filter(Boolean);
        return !ids.some((id) => storedCompleted.includes(id));
      });
    }

    if (!currentActiveLesson) {
      const activeLessonIndex = Math.min(Math.max(0, allLessons.length - 1), completedLessonsCount);
      currentActiveLesson = allLessons[activeLessonIndex] || allLessons[0] || {
        title: "Lecture 1: Welcome & Course Setup",
        sectionTitle: "Section 1",
      };
    }

    const activeLessonParam = currentActiveLesson?._id || currentActiveLesson?.id || currentActiveLesson?.slug || "";
    const resumeUrl = `/student/learn/${course.slug || course._id}${activeLessonParam ? `?lessonId=${encodeURIComponent(activeLessonParam)}` : ""}`;

    // Course Quizzes
    const courseQuizzes = quizSubmissions.filter(
      (q) => q.courseId === courseKey || q.course?._id === course._id || q.course === course._id
    );
    const hasQuizzes = courseQuizzes.length > 0;
    const quizScore = hasQuizzes
      ? Math.round(courseQuizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) / courseQuizzes.length)
      : null;

    // Course Assignments
    const courseAssignments = assignmentSubmissions.filter(
      (a) => a.courseId === courseKey || a.course?._id === course._id || a.course === course._id
    );
    const hasAssignments = courseAssignments.length > 0;
    const gradedAssignments = courseAssignments.filter((a) => a.grade !== undefined && a.grade !== null);
    const assignmentScore = gradedAssignments.length > 0
      ? Math.round(gradedAssignments.reduce((acc, a) => acc + a.grade, 0) / gradedAssignments.length)
      : null;

    // Grade and GPA evaluation (Only if student has taken evaluations)
    const isGraded = quizScore !== null || assignmentScore !== null;
    let totalAverageMarks = 0;
    let courseGrade = "—";
    let courseGPA = 0;
    let gradeColor = "text-slate-400 bg-slate-800/40 border-slate-700";

    if (isGraded) {
      if (quizScore !== null && assignmentScore !== null) {
        totalAverageMarks = Math.round(quizScore * 0.4 + assignmentScore * 0.6);
      } else if (quizScore !== null) {
        totalAverageMarks = quizScore;
      } else if (assignmentScore !== null) {
        totalAverageMarks = assignmentScore;
      }
      const evalResult = calculateGradeAndGPA(totalAverageMarks);
      courseGrade = evalResult.grade;
      courseGPA = evalResult.gpa;
      gradeColor = evalResult.color;
    }

    return {
      ...course,
      totalLessons,
      completedLessonsCount,
      progressPercentage,
      isCompleted,
      currentActiveLesson,
      resumeUrl,
      quizScore,
      hasQuizzes,
      assignmentScore,
      hasAssignments,
      isGraded,
      totalAverageMarks,
      courseGrade,
      courseGPA,
      gradeColor,
      courseQuizzes,
      courseAssignments,
    };
  });

  // Global Academic Summary Statistics
  const totalEnrolled = enrolledCoursesData.length;
  const completedCoursesCount = enrolledCoursesData.filter((c) => c.isCompleted).length;
  const inProgressCoursesCount = totalEnrolled - completedCoursesCount;
  const totalCompletedLessons = Object.values(userProgressMap).reduce((acc, curr) => acc + curr.length, 0);

  // Real Quiz statistics
  const totalQuizzesTaken = quizSubmissions.length;
  const passedQuizzesCount = quizSubmissions.filter((q) => q.passed).length;
  const avgQuizMarks = totalQuizzesTaken > 0
    ? Math.round(quizSubmissions.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalQuizzesTaken)
    : 0;

  // Real Assignment statistics
  const totalAssignmentsSubmitted = assignmentSubmissions.length;
  const gradedAssignmentsCount = assignmentSubmissions.filter((a) => a.grade !== undefined).length;
  const avgAssignmentMarks = gradedAssignmentsCount > 0
    ? Math.round(assignmentSubmissions.reduce((acc, a) => acc + (a.grade || 0), 0) / gradedAssignmentsCount)
    : 0;

  // Overall CGPA
  const gradedCourses = enrolledCoursesData.filter((c) => c.isGraded);
  const overallCGPA = gradedCourses.length > 0
    ? (gradedCourses.reduce((acc, c) => acc + c.courseGPA, 0) / gradedCourses.length).toFixed(2)
    : "0.00";
  const overallAvgMarks = gradedCourses.length > 0
    ? Math.round(gradedCourses.reduce((acc, c) => acc + c.totalAverageMarks, 0) / gradedCourses.length)
    : 0;
  const overallGrade = gradedCourses.length > 0 ? calculateGradeAndGPA(overallAvgMarks).grade : "—";
  // Dynamic Total Earned XP
  const totalXP = totalCompletedLessons * 50 + passedQuizzesCount * 100 + gradedAssignmentsCount * 150;

  // Active Live Session check
  const activeLiveSession = liveClasses.find((l) => l.status === "live");

  // Resume First In-Progress Course
  const activeCourse = enrolledCoursesData.find((c) => !c.isCompleted) || enrolledCoursesData[0];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8">
        
        {/* 🔴 ACTIVE LIVE CLASS HAPPENING NOW BANNER */}
        {activeLiveSession && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-purple-950/90 border border-rose-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in ring-1 ring-rose-500/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-900/40">
                <Radio className="w-6 h-6 animate-pulse text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/40">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>LIVE CLASSROOM ACTIVE</span>
                  </span>
                  <span className="text-xs text-purple-300 font-bold hidden sm:inline">
                    {(activeLiveSession.course as any)?.title || "Enrolled Course"}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1">
                  {activeLiveSession.title}
                </h3>
                <p className="text-xs text-slate-300">
                  Instructor: <strong className="text-purple-300">{activeLiveSession.teacherName || "Instructor"}</strong> • Live HD Audio, Video & Real-Time Q&A
                </p>
              </div>
            </div>

            <Link
              href={`/live/${activeLiveSession._id}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 hover:scale-105 transition-all shrink-0 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Join Live Classroom Now</span>
            </Link>
          </div>
        )}

        {/* 1. HERO HEADER WITH STUDENT GREETING & RESUME SHORTCUT */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-900/40 px-3.5 py-1 rounded-full border border-purple-500/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>
                {totalCompletedLessons > 0
                  ? `${totalCompletedLessons} Lessons Completed • ${totalXP} Total XP Earned`
                  : "Welcome to EduCore LMS • Start Your Learning Journey"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome Back, {user?.name || "Student"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track your real course progress, interactive lecture completions, quiz assessments, and academic transcripts.
            </p>
          </div>

          {activeCourse ? (
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href={activeCourse.resumeUrl || `/student/learn/${activeCourse.slug || activeCourse._id}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2.5 shadow-xl shadow-purple-600/30 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{activeCourse.completedLessonsCount > 0 ? "Resume Current Lecture" : "Start Learning Now"}</span>
              </Link>
              <p className="text-[10px] text-slate-400 text-center md:text-right mt-1.5 line-clamp-1 max-w-xs">
                📍 {activeCourse.currentActiveLesson?.title}
              </p>
            </div>
          ) : (
            <Link
              href="/courses"
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white gradient-button flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Courses</span>
            </Link>
          )}
        </div>

        {/* 2. ACADEMIC CGPA & PERFORMANCE METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Cumulative CGPA & Grade */}
          <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-slate-900 flex flex-col justify-between space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Cumulative CGPA</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{overallCGPA}</span>
                <span className="text-xs text-slate-400">/ 4.00</span>
                <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  gradedCourses.length > 0
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  {gradedCourses.length > 0 ? `Grade ${overallGrade}` : "Not Graded"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {gradedCourses.length > 0 ? (
                  <>Average Marks: <strong className="text-purple-300">{overallAvgMarks}%</strong></>
                ) : (
                  "Complete quizzes to generate CGPA"
                )}
              </p>
            </div>
          </div>

          {/* Card 2: Quiz Assessment */}
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 flex flex-col justify-between space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Quiz Assessment</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {totalQuizzesTaken > 0 ? `${avgQuizMarks}%` : "0%"}
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {passedQuizzesCount} Passed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {totalQuizzesTaken > 0
                  ? `${totalQuizzesTaken} Quiz Attempt${totalQuizzesTaken > 1 ? "s" : ""} Recorded`
                  : "No quizzes attempted yet"}
              </p>
            </div>
          </div>

          {/* Card 3: Assignment Projects */}
          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900 flex flex-col justify-between space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Assignment Projects</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {totalAssignmentsSubmitted}
                </span>
                <span className="text-xs text-slate-400">Submitted</span>
                <span className="ml-auto text-xs font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {gradedAssignmentsCount} Graded
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {totalAssignmentsSubmitted > 0 ? "Hands-on projects submitted" : "No assignments submitted yet"}
              </p>
            </div>
          </div>

          {/* Card 4: Course Completion */}
          <div className="glass-panel p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-slate-900 flex flex-col justify-between space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Course Completion</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{completedCoursesCount}</span>
                <span className="text-xs text-slate-400">/ {totalEnrolled} Enrolled</span>
                <span className="ml-auto text-xs font-bold text-blue-300">
                  {inProgressCoursesCount} In Progress
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {completedCoursesCount > 0 ? "Verified Certificate Eligible" : "0 Courses Completed"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. MAIN DASHBOARD CONTENT AREA - FULL WIDTH TABS */}
        <div className="space-y-6">
          
          {/* Tab Navigation Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleTabChange("courses")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === "courses"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses ({totalEnrolled})</span>
              </button>


                <button
                  onClick={() => handleTabChange("liveClasses")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "liveClasses"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Live Classes ({liveClasses.length})</span>
                  {activeLiveSession && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleTabChange("grades")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "grades"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Transcript (CGPA)</span>
                </button>


                <button
                  onClick={() => handleTabChange("quizzes")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "quizzes"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Quiz Reports ({totalQuizzesTaken})</span>
                </button>

                <button
                  onClick={() => handleTabChange("assignments")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "assignments"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Assignments ({totalAssignmentsSubmitted})</span>
                </button>

                <button
                  onClick={() => handleTabChange("certificates")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "certificates"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Certificates ({completedCoursesCount})</span>
                </button>
              </div>

              <Link
                href="/courses"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 hidden sm:inline-flex items-center gap-1 shrink-0"
              >
                <span>Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* TAB 1: MY ENROLLED COURSES */}
            {activeTab === "courses" && (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="py-8">
                    <EduCoreLoader message="Loading your enrolled courses & academic progress" />
                  </div>
                ) : enrolledCoursesData.length > 0 ? (
                  enrolledCoursesData.map((course) => {
                    const teacherName =
                      typeof course.teacher === "object" && course.teacher?.name
                        ? course.teacher.name
                        : "EduCore Instructor";

                    return (
                      <div
                        key={course._id}
                        className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/90 space-y-4 hover:border-purple-500/40 transition-all group shadow-lg"
                      >
                        {/* Course Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Link href={course.resumeUrl || `/student/learn/${course.slug || course._id}`}>
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-24 h-16 rounded-2xl object-cover border border-slate-800 shrink-0 group-hover:scale-105 transition-transform cursor-pointer"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                                {course.category || "General"}
                              </span>
                              <Link href={course.resumeUrl || `/student/learn/${course.slug || course._id}`}>
                                <h3 className="text-sm font-bold text-white line-clamp-1 mt-0.5 hover:text-purple-300 transition-colors cursor-pointer">
                                  {course.title}
                                </h3>
                              </Link>
                              <p className="text-xs text-slate-400 mt-0.5">By {teacherName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              course.isGraded
                                ? course.gradeColor
                                : "text-slate-400 bg-slate-900 border-slate-800"
                            }`}>
                              {course.isGraded
                                ? `Grade ${course.courseGrade} (${course.courseGPA.toFixed(2)} GPA • ${course.totalAverageMarks}%)`
                                : course.isCompleted
                                ? "Completed (Pending Grading)"
                                : "In Progress"}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">
                              Lessons: <strong className="text-white">{course.completedLessonsCount} of {course.totalLessons} Completed</strong>
                            </span>
                            <span className="text-purple-400 font-bold">{course.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${course.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Current Lecture Position & Marks */}
                        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Currently On Lecture:</span>
                            <span className="text-purple-300 font-bold line-clamp-1">
                              📍 {course.currentActiveLesson?.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {course.isGraded && (
                              <div className="text-right">
                                <span className="text-[11px] text-slate-400 block">Course Marks:</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {course.totalAverageMarks}/100 ({course.courseGrade})
                                </span>
                              </div>
                            )}

                            <Link
                              href={course.resumeUrl || `/student/learn/${course.slug || course._id}`}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-1.5 shadow-md shadow-purple-600/20 hover:scale-105 transition-all cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Resume</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">No Enrolled Courses Yet</h3>
                    <p className="text-xs text-slate-400">Enroll in top courses from the catalog to start learning.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LIVE INTERACTIVE CLASSES */}
            {activeTab === "liveClasses" && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
                      <span>Live Interactive Classes</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Join real-time video lectures, ask questions live, and collaborate with your instructors.
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block">Total Live Sessions</span>
                    <span className="text-2xl font-black text-white">{liveClasses.length}</span>
                  </div>
                </div>

                {liveClasses.length === 0 ? (
                  <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800/80 space-y-3">
                    <Radio className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-white">No Live Classes Scheduled Right Now</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your course instructors will schedule live classes here. You will automatically receive an email alert whenever a live session is announced!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveClasses.map((session) => {
                      const isLive = session.status === "live";
                      const isCompleted = session.status === "completed";
                      const courseTitle = (session.course as any)?.title || "Enrolled Course";
                      const dateStr = new Date(session.scheduledStartTime).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={session._id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isLive
                              ? "bg-slate-900/90 border-rose-500/50 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30"
                              : "bg-slate-950 border-slate-800 hover:border-purple-500/30"
                          } space-y-4 flex flex-col justify-between`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate max-w-[180px]">
                                {courseTitle}
                              </span>
                              {isLive ? (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                  <span>LIVE NOW</span>
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  COMPLETED
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                  UPCOMING
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-white line-clamp-1">{session.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2">{session.description || "Interactive live session with audio, video, and collaborative QA."}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                <span>Time</span>
                              </span>
                              <span className="font-semibold text-white">{dateStr}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                <span>Duration</span>
                              </span>
                              <span className="font-semibold text-white">{session.durationMinutes} Mins</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Instructor</span>
                              </span>
                              <span className="font-semibold text-purple-300">{session.teacherName || "Instructor"}</span>
                            </div>
                          </div>

                          <div className="pt-1">
                            <Link
                              href={`/live/${session._id}`}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                                isLive
                                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/40 animate-pulse"
                                  : isCompleted
                                  ? "bg-slate-800 text-slate-400 hover:text-white"
                                  : "gradient-button shadow-purple-600/20 hover:scale-[1.02]"
                              }`}
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>{isLive ? "🔴 Join Live Classroom Now" : isCompleted ? "View Past Room" : "Join Session Room"}</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACADEMIC TRANSCRIPT & CGPA REPORT SHEET */}
            {activeTab === "grades" && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                      <span>Academic Transcript & Grade Sheet</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cumulative Grade Point Average (CGPA) calculated from graded quizzes and verified assignments on a standard 4.00 scale.
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-center sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-purple-300 block">Overall CGPA</span>
                    <span className="text-2xl font-black text-white">{overallCGPA}</span>
                    <span className="text-xs text-purple-400 font-bold ml-1">/ 4.00</span>
                  </div>
                </div>

                {/* Grading Scale Legend */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-purple-300">CGPA Grading Scale:</span>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">80%+: A+ (4.00)</span>
                    <span className="bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">75-79%: A (3.75)</span>
                    <span className="bg-blue-950/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">70-74%: A- (3.50)</span>
                    <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">65-69%: B+ (3.25)</span>
                    <span className="bg-amber-950/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">60-64%: B (3.00)</span>
                    <span className="bg-orange-950/60 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded font-mono">50-59%: C/C+ (2.25-2.50)</span>
                    <span className="bg-rose-950/60 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">40-49%: D (2.00)</span>
                    <span className="bg-red-950/60 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono">&lt;40%: F (0.00)</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Course Name</th>
                        <th className="p-3">Quiz Score</th>
                        <th className="p-3">Assignment</th>
                        <th className="p-3">Average %</th>
                        <th className="p-3">Grade</th>
                        <th className="p-3">GPA</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {enrolledCoursesData.map((course) => (
                        <tr key={course._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-bold text-white max-w-xs truncate">{course.title}</td>
                          <td className="p-3 font-semibold">
                            {course.quizScore !== null ? (
                              <span className="text-amber-300">{course.quizScore}%</span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold">
                            {course.assignmentScore !== null ? (
                              <span className="text-emerald-300">{course.assignmentScore}/100</span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-3 font-black">
                            {course.isGraded ? (
                              <span className="text-purple-300">{course.totalAverageMarks}%</span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {course.isGraded ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${course.gradeColor}`}>
                                {course.courseGrade}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Pending</span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-white">
                            {course.isGraded ? course.courseGPA.toFixed(2) : "0.00"}
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/student/learn/${course.slug || course._id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-600 border border-slate-800 text-slate-300 hover:text-white transition-all text-[11px] font-bold"
                            >
                              Learn
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: QUIZZES */}
            {activeTab === "quizzes" && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Quiz Assessments Log</span>
                </h2>

                {quizSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {quizSubmissions.map((sub, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-white">{sub.quizTitle || sub.quiz?.title || "Lesson Quiz Assessment"}</h4>
                          <p className="text-[11px] text-slate-400">
                            Score: {sub.score || 0} / {sub.totalQuestions || 0} correct questions
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-amber-300 block">{sub.percentage}%</span>
                          <span className={`text-[10px] font-bold ${sub.passed ? "text-emerald-400" : "text-rose-400"}`}>
                            {sub.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">No quizzes attempted yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Interactive quizzes in your lessons will automatically record your scores, pass/fail status, and XP here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ASSIGNMENTS */}
            {activeTab === "assignments" && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Submitted Projects & Reviews</span>
                </h2>

                {assignmentSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {assignmentSubmissions.map((sub, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-white">{sub.assignment?.title || "Course Project Assignment"}</h4>
                          <p className="text-[11px] text-slate-400">
                            {sub.feedback || "Submission recorded — instructor review in progress."}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-300 block">
                            {sub.grade !== undefined ? `${sub.grade}/100` : "Pending"}
                          </span>
                          <span className="text-[10px] text-purple-400 font-bold capitalize">
                            {sub.status || "Submitted"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">No assignments submitted yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Hands-on project assignments submitted inside your courses will appear here with instructor grades and feedback.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CERTIFICATES */}
            {activeTab === "certificates" && (
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Certificates & Credentials</span>
                </h2>

                {completedCoursesCount > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enrolledCoursesData.filter((c) => c.isCompleted).map((course) => (
                      <div key={course._id} className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <Award className="w-6 h-6 text-purple-400" />
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            Verified
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs">{course.title}</h4>
                        <Link
                          href={`/student/learn/${course.slug || course._id}`}
                          className="block w-full py-2 rounded-xl text-center text-xs font-bold text-white gradient-button"
                        >
                          View Certificate
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2">
                    <Award className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">No certificates unlocked yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Complete 100% of the video lectures, quizzes, and assignments in a course to generate your official verified certificate.
                    </p>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* 4. LEARNING VELOCITY ANALYTICS GRAPH (FULL WIDTH) */}
        <div className="w-full">
          <StudentCharts totalCompletedLessons={totalCompletedLessons} />
        </div>

        {/* 5. GAMIFICATION & LEADERBOARD (MASTERY LEVEL 1 & WEEKLY RANKINGS) */}
        <div className="w-full">
          <GamificationWidget
            totalXP={totalXP}
            completedLessonsCount={totalCompletedLessons}
            passedQuizzesCount={passedQuizzesCount}
            submittedAssignmentsCount={totalAssignmentsSubmitted}
            completedCoursesCount={completedCoursesCount}
            user={user}
          />
        </div>


      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <EduCoreLoader message="Loading student dashboard..." />
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}


