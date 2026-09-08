"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Radio,
  Calendar,
} from "lucide-react";
import { API_BASE_URL, CourseType } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { UniversalVideoPlayer } from "@/components/video/UniversalVideoPlayer";
import { EduCoreLoader } from "@/components/EduCoreLoader";
import Swal from "sweetalert2";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshEnrolledCourses } = useAuth();

  const [course, setCourse] = useState<CourseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [courseLiveClasses, setCourseLiveClasses] = useState<any[]>([]);


  useEffect(() => {
    const fetchCourseDetail = async () => {
      setIsLoading(true);
      const targetId = params.courseId as string;

      let loadedCourse: CourseType | null = null;

      // 1. Try fetching from backend API first with fresh data
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${targetId}?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (data.success && data.course) {
          loadedCourse = data.course;
          setCourse(data.course);
        }
      } catch (e) {
        console.warn("Backend course fetch error:", e);
      }

      // 2. Fallback to local storage created courses if offline
      if (!loadedCourse) {
        try {
          const localCreated: CourseType[] = JSON.parse(localStorage.getItem("educore_created_courses") || "[]");
          const foundLocal = localCreated.find((c) => c.slug === targetId || String(c._id) === targetId);
          if (foundLocal) {
            loadedCourse = foundLocal;
            setCourse(foundLocal);
          }
        } catch (e) {}
      }

      // 3. Check student enrollment status
      if (user && user.role === "student") {
        let enrolled = false;
        let completed: string[] = [];

        // Check local storage records
        try {
          const storedEnrolled: string[] = JSON.parse(localStorage.getItem("educore_enrolled_courses") || "[]");
          const localProgress = localStorage.getItem(`educore_progress_${targetId}`);
          if (localProgress) {
            completed = JSON.parse(localProgress);
            enrolled = true;
          }
          if (
            storedEnrolled.includes(targetId) ||
            (loadedCourse && (storedEnrolled.includes(loadedCourse._id) || (loadedCourse.slug && storedEnrolled.includes(loadedCourse.slug))))
          ) {
            enrolled = true;
          }
        } catch (e) {}

        // Check backend enrollment/progress if token available
        const token = typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("educore_token")) : null;
        if (token) {
          try {
            const pRes = await fetch(`${API_BASE_URL}/student/progress/${targetId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const pData = await pRes.json();
            if (pData.success) {
              if (pData.isEnrolled || (pData.progress?.completedLessons && pData.progress.completedLessons.length > 0)) {
                enrolled = true;
              }
              if (pData.progress?.completedLessons) {
                completed = Array.from(new Set([...completed, ...pData.progress.completedLessons]));
              }
            }
          } catch (e) {}
        }

        setIsEnrolled(enrolled);
        setCompletedLessons(completed);
      } else {
        setIsEnrolled(false);
      }

      // Fetch live interactive sessions for this course
      try {
        const liveRes = await fetch(`${API_BASE_URL}/live-classes/course/${targetId}?t=${Date.now()}`);
        const liveData = await liveRes.json();
        if (liveData.success && Array.isArray(liveData.liveClasses)) {
          setCourseLiveClasses(liveData.liveClasses);
        }
      } catch (e) {}

      setIsLoading(false);
    };

    if (params.courseId) {
      fetchCourseDetail();
    }
  }, [params.courseId, user]);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <EduCoreLoader message="Loading course curriculum & video preview" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="glass-panel p-10 rounded-3xl border border-slate-800 max-w-md w-full">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">The requested course could not be located in our database.</p>
          <Link
            href="/courses"
            className="px-6 py-3 rounded-xl text-xs font-bold text-white gradient-button inline-flex items-center gap-2"
          >
            <span>Explore All Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  const isMongoId = (str: any) => typeof str === "string" && /^[0-9a-fA-F]{24}$/.test(str);

  const rawTeacherName =
    (typeof course.teacher === "object" && course.teacher?.name && !isMongoId(course.teacher.name) ? course.teacher.name : null) ||
    (course.teacherName && !isMongoId(course.teacherName) ? course.teacherName : null) ||
    (course.instructorName && !isMongoId(course.instructorName) ? course.instructorName : null) ||
    (typeof course.teacher === "string" && !isMongoId(course.teacher) && course.teacher.length < 35 ? course.teacher : null);

  const teacherName = rawTeacherName || "Asma Akter";

  const teacherAvatar =
    (typeof course.teacher === "object" && course.teacher?.avatar) ||
    course.teacherAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=7c3aed&color=fff&bold=true`;

  const teacherTitle =
    (typeof course.teacher === "object" && course.teacher?.title) ||
    course.teacherTitle ||
    "Course Instructor & Educator";

  const teacherBio =
    (typeof course.teacher === "object" && course.teacher?.bio) ||
    course.teacherBio ||
    `${teacherName} is a verified course creator and educator on the EduCore platform.`;

  const learningOutcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];
  const sections = Array.isArray(course.sections) ? course.sections : [];
  const rating = typeof course.averageRating === "number" && course.averageRating > 0 ? course.averageRating : 0;
  const reviews = typeof course.totalReviews === "number" ? course.totalReviews : 0;
  const rawStudents = typeof course.totalStudents === "number" ? course.totalStudents : 0;
  const students = rawStudents > 0 ? rawStudents : isEnrolled ? 1 : 0;
  const totalLessonsCount =
    course.totalLessons || sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
  const totalDuration = course.totalDurationMinutes || 0;

  const progressPercentage = Math.min(
    100,
    Math.round((completedLessons.length / Math.max(1, totalLessonsCount)) * 100)
  );


  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME50") {
      setAppliedDiscount(50);
      setCouponMsg("50% OFF Coupon applied successfully!");
    } else {
      setCouponMsg("Invalid coupon code.");
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "Student Account Required",
        text: "Please login or register as a Student to enroll in this course.",
        showCancelButton: true,
        confirmButtonText: "Login as Student",
        confirmButtonColor: "#7c3aed",
        background: "#0f172a",
        color: "#ffffff",
      }).then((res) => {
        if (res.isConfirmed) {
          router.push(`/login?redirect=/courses/${course?.slug || course?._id}`);
        }
      });
      return;
    }

    if (user.role !== "student") {
      Swal.fire({
        icon: "warning",
        title: "Student Role Required",
        text: `You are currently logged in as a ${user.role}. Course enrollment is for Students. Teachers and Admins have full management control in their Dashboard.`,
        confirmButtonColor: "#7c3aed",
        background: "#0f172a",
        color: "#ffffff",
      });
      return;
    }

    setIsEnrolling(true);

    try {
      // 1. Update localStorage
      const storedEnrolled: string[] = JSON.parse(localStorage.getItem("educore_enrolled_courses") || "[]");
      const courseKey = course.slug || course._id;
      if (!storedEnrolled.includes(courseKey)) {
        storedEnrolled.push(courseKey);
      }
      if (course._id && !storedEnrolled.includes(course._id)) {
        storedEnrolled.push(course._id);
      }
      localStorage.setItem("educore_enrolled_courses", JSON.stringify(storedEnrolled));

      // 2. Call backend enrollment API if token exists
      const token = localStorage.getItem("token") || localStorage.getItem("educore_token");
      if (token) {
        await fetch(`${API_BASE_URL}/student/enroll`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: course._id || course.slug }),
        });

        if (refreshEnrolledCourses) {
          await refreshEnrolledCourses(token);
        }
      }

      setIsEnrolled(true);

      // Student Enrolled!
      Swal.fire({
        icon: "success",
        title: "Enrollment Confirmed! 🎉",
        text: "You are now enrolled in this course. Taking you to your course player...",
        timer: 1500,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#ffffff",
      });

      setTimeout(() => {
        router.push(`/student/learn/${course?.slug || course?._id}`);
      }, 1500);
    } catch (e) {
      console.error("Enrollment error:", e);
      router.push(`/student/learn/${course?.slug || course?._id}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <span>{course.category || "General"}</span> • <span>{course.level || "All Levels"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              {course.shortDescription || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
              {reviews > 0 ? (
                <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold">{rating.toFixed(1)}</span>
                  <span className="text-slate-400">({reviews} reviews)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-purple-300 bg-purple-900/30 border border-purple-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                  <span>New Course</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{students} enrolled students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{course.language || "English"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-10 h-10 rounded-full border-2 border-purple-500/40"
              />
              <div>
                <p className="text-xs text-slate-400">Created by</p>
                <p className="text-sm font-bold text-white">{teacherName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details, Curriculum, Instructor */}
          <div className="lg:col-span-2 space-y-12">
            {/* Enrolled Status Notice Bar if enrolled */}
            {isEnrolled && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-purple-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>You are enrolled in this course</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {completedLessons.length} of {totalLessonsCount} lessons completed ({progressPercentage}%)
                    </p>
                  </div>
                </div>

                <Link
                  href={`/student/learn/${course.slug || course._id}`}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-2 shadow-lg shadow-purple-600/30 shrink-0 hover:scale-105 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Course</span>
                </Link>
              </div>
            )}

            {/* Learning Outcomes */}
            {learningOutcomes.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  {learningOutcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPCOMING LIVE SESSIONS FOR THIS COURSE */}
            {courseLiveClasses.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-purple-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Live Interactive Sessions</h3>
                      <p className="text-xs text-slate-400">Exclusive live workshops and Q&A scheduled for this course</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full">
                    {courseLiveClasses.length} Scheduled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {courseLiveClasses.map((session) => {
                    const isLive = session.status === "live";
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
                        className={`p-4 rounded-2xl border ${
                          isLive
                            ? "bg-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/40"
                            : "bg-slate-950/80 border-slate-800"
                        } space-y-3 flex flex-col justify-between`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-purple-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{dateStr}</span>
                            </span>
                            {isLive && (
                              <span className="font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{session.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{session.description || "Live lecture and real-time student Q&A."}</p>
                        </div>

                        {isEnrolled ? (
                          <Link
                            href={`/live/${session._id}`}
                            className={`w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all ${
                              isLive
                                ? "bg-rose-600 hover:bg-rose-500 animate-pulse"
                                : "gradient-button"
                            }`}
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>{isLive ? "Join Live Classroom" : "Access Live Room"}</span>
                          </Link>
                        ) : (
                          <button
                            onClick={handleEnroll}
                            className="w-full py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <span>Enroll to Participate</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Curriculum Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Course Curriculum</h3>

                <span className="text-xs text-slate-400">
                  {sections.length} Sections • {totalLessonsCount} Lessons • {totalDuration}m total
                </span>
              </div>

              <div className="space-y-3">
                {sections.map((section, idx) => {
                  const isOpen = expandedSection === section._id || idx === 0;
                  const lessons = Array.isArray(section.lessons) ? section.lessons : [];
                  return (
                    <div key={idx} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(isOpen ? null : section._id || String(idx))}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/60 transition-colors"
                      >
                        <span className="text-sm font-bold text-white">{section.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{lessons.length} lessons</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-slate-950/40">
                          {lessons.map((lesson: any, lIdx: number) => {
                            const lessonId = lesson._id || lesson.id || String(lIdx);
                            const isQuiz = lesson.type === "quiz";
                            const isAssignment = lesson.type === "assignment";
                            const isLessonCompleted = completedLessons.includes(lessonId);

                            return (
                              <div
                                key={lIdx}
                                onClick={() => {
                                  if (isEnrolled) {
                                    router.push(`/student/learn/${course.slug || course._id}?lessonId=${lessonId}`);
                                    return;
                                  }
                                  if (lesson.isFreePreview) {
                                    setShowPreviewModal(true);
                                    return;
                                  }
                                  handleEnroll();
                                }}
                                className="p-3.5 flex items-center justify-between text-xs text-slate-300 hover:bg-purple-950/30 hover:text-white cursor-pointer transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  {isLessonCompleted ? (
                                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                  ) : isQuiz ? (
                                    <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-110 transition-transform">
                                      <HelpCircle className="w-3 h-3" />
                                    </div>
                                  ) : isAssignment ? (
                                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                                      <BookOpen className="w-3 h-3" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-110 transition-transform">
                                      <Play className="w-3 h-3 ml-0.5" />
                                    </div>
                                  )}
                                  <span className="group-hover:text-purple-300 transition-colors font-medium">
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  {isLessonCompleted && (
                                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                                      Completed
                                    </span>
                                  )}
                                  {isQuiz && (
                                    <span className="text-[10px] font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
                                      Quiz
                                    </span>
                                  )}
                                  {isAssignment && (
                                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/30">
                                      Assignment
                                    </span>
                                  )}
                                  {!isEnrolled && lesson.isFreePreview && !isQuiz && !isAssignment && (
                                    <span className="text-[10px] font-bold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                                      Free Preview
                                    </span>
                                  )}
                                  {lesson.durationMinutes && Number(lesson.durationMinutes) > 0 ? (
                                    <span className="text-slate-500">{lesson.durationMinutes} mins</span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Info */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex items-start gap-5">
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/40"
              />
              <div>
                <h4 className="text-lg font-bold text-white">{teacherName}</h4>
                <p className="text-xs text-purple-400 font-medium mb-2">{teacherTitle}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{teacherBio}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing or Active Enrolled Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-panel p-6 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
              {/* Media Preview Box */}
              <div
                onClick={() => setShowPreviewModal(true)}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 cursor-pointer group"
              >
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full gradient-button flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* DYNAMIC CARD CONTENT BASED ON ENROLLMENT / ROLE */}
              {isEnrolled ? (
                /* ENROLLED STUDENT VIEW */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Enrolled in this Course</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-300">
                        {progressPercentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {completedLessons.length} of {totalLessonsCount} lessons completed
                    </p>
                  </div>

                  <Link
                    href={`/student/learn/${course.slug || course._id}`}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white gradient-button shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Continue Learning</span>
                  </Link>

                  <Link
                    href="/student/dashboard"
                    className="w-full py-3 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/80 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span>Go to Student Dashboard</span>
                  </Link>
                </div>
              ) : user?.role === "teacher" ? (
                /* TEACHER VIEW */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>Teacher Account: You manage courses from Teacher Studio. Students enroll to watch.</span>
                  </div>
                  <button
                    onClick={() => router.push("/teacher/dashboard")}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Go to Teacher Studio</span>
                  </button>
                </div>
              ) : user?.role === "admin" ? (
                /* ADMIN VIEW */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Admin Account: You have full platform management access in Admin Dashboard.</span>
                  </div>
                  <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white gradient-button transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Go to Admin Dashboard</span>
                  </button>
                </div>
              ) : (
                /* NOT ENROLLED VIEW (VISITOR / NEW STUDENT) */
                <div className="space-y-6">
                  {/* Price Display */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ${appliedDiscount > 0 ? (course.price * 0.5).toFixed(2) : (course.discountPrice || course.price).toFixed(2)}
                      </span>
                      {course.discountPrice && (
                        <span className="text-sm text-slate-500 line-through">${course.price.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Coupon Code Input */}
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon (e.g. WELCOME50)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 flex-1 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-300 px-3 py-1.5 rounded-xl border border-slate-700"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMsg && <p className="text-[11px] font-medium text-emerald-400 mt-1">{couponMsg}</p>}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white gradient-button shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isEnrolling ? "Enrolling..." : "Enroll & Start Learning Now"}</span>
                  </button>
                </div>
              )}

              {/* Guarantee list */}
              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Full Lifetime Access</span>
                </div>
                {course.hasCertificate && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Certificate of Completion</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Video Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Free Course Preview</span>
                <h3 className="text-sm font-bold text-white truncate max-w-md">{course.title}</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-slate-950">
              <UniversalVideoPlayer
                url={course.previewVideo || (course.sections[0]?.lessons[0]?.contentUrl)}
                provider={course.sections[0]?.lessons[0]?.videoProvider}
                title={course.title}
                poster={course.thumbnail}
                autoPlay={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

