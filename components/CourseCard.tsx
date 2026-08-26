"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Clock, BookOpen, Users, ArrowRight, Play, CheckCircle } from "lucide-react";
import { CourseType } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CourseCardProps {
  course: CourseType;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "student") {
      setIsEnrolled(false);
      return;
    }

    const courseKey = course.slug || course._id;
    try {
      const storedEnrolled: string[] = JSON.parse(localStorage.getItem("educore_enrolled_courses") || "[]");
      const hasProgress = Boolean(localStorage.getItem(`educore_progress_${courseKey}`));
      
      if (
        storedEnrolled.includes(courseKey) ||
        storedEnrolled.includes(course._id) ||
        (course.slug && storedEnrolled.includes(course.slug)) ||
        hasProgress
      ) {
        setIsEnrolled(true);
      }
    } catch (e) {}
  }, [user, course]);

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

  const thumbnail =
    course.thumbnail ||
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800";

  const totalLessonsCount =
    course.totalLessons ||
    (Array.isArray(course.sections)
      ? course.sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0)
      : 0);

  const price = typeof course.price === "number" ? course.price : 0;
  const rating = typeof course.averageRating === "number" ? course.averageRating : 0;
  const reviews = typeof course.totalReviews === "number" ? course.totalReviews : 0;
  const rawStudents = typeof course.totalStudents === "number" ? course.totalStudents : 0;
  const students = rawStudents > 0 ? rawStudents : isEnrolled ? 1 : 0;



  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student" || !user;

  const isOwner =
    isTeacher &&
    ((typeof course.teacher === "object" && (course.teacher?._id === user?.id || course.teacher?._id === (user as any)?._id)) ||
      course.teacher === user?.id ||
      course.teacher === (user as any)?._id ||
      (course.teacherName && user?.name && course.teacherName.toLowerCase() === user?.name.toLowerCase()) ||
      (course.instructorName && user?.name && course.instructorName.toLowerCase() === user?.name.toLowerCase()));

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 bg-slate-900/60 hover:border-purple-500/40 transition-all">
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <img
          src={thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur-md text-purple-200 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {course.category || "General"}
        </div>
        {isTeacher && isOwner ? (
          <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg border border-purple-400/30">
            <span>Your Course</span>
          </div>
        ) : isTeacher ? (
          <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <span>Instructor View</span>
          </div>
        ) : isEnrolled ? (
          <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <CheckCircle className="w-3 h-3 text-slate-950" />
            <span>Enrolled</span>
          </div>
        ) : course.discountPrice ? (
          <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
            Save ${(price - course.discountPrice).toFixed(0)}
          </div>
        ) : null}
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs mb-2.5">
            {reviews > 0 ? (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-slate-500">({reviews})</span>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-purple-400 bg-purple-900/30 border border-purple-500/30 px-2 py-0.5 rounded-md">
                New Course
              </span>
            )}
            <span className="text-slate-400 text-[11px] font-medium">{course.level || "All Levels"}</span>
          </div>

          {/* Title */}
          <Link
            href={
              isTeacher
                ? `/student/learn/${course.slug || course._id}`
                : isEnrolled
                  ? `/student/learn/${course.slug || course._id}`
                  : `/courses/${course.slug || course._id}`
            }
          >
            <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug mb-2">
              {course.title}
            </h3>
          </Link>

          {/* Instructor info */}
          <div className="flex items-center gap-2 mb-4">
            <img
              src={teacherAvatar}
              alt={teacherName}
              className="w-6 h-6 rounded-full object-cover border border-purple-500/30"
            />
            <span className="text-xs text-slate-400 font-medium truncate">{teacherName}</span>
          </div>
        </div>

        {/* Metadata footer */}
        <div className="border-t border-slate-800/80 pt-4 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>{totalLessonsCount} Lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{students} Students</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {isTeacher ? (
              <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
                <span>Instructor Access</span>
              </div>
            ) : isEnrolled ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Active Access</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-white">
                  {price === 0 ? "Free" : `$${course.discountPrice ? course.discountPrice.toFixed(2) : price.toFixed(2)}`}
                </span>
                {course.discountPrice && (
                  <span className="text-xs text-slate-500 line-through">${price.toFixed(2)}</span>
                )}
              </div>
            )}

            {isTeacher ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/student/learn/${course.slug || course._id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all border border-slate-700/60"
                  title="Preview Course Player"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Preview</span>
                </Link>
                <Link
                  href={isOwner ? `/teacher/courses/create?id=${course._id}` : `/teacher/dashboard`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-all"
                >
                  <span>{isOwner ? "Manage" : "Studio"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : isAdmin ? (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-all"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : isEnrolled ? (
              <Link
                href={`/student/learn/${course.slug || course._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 hover:bg-purple-600 hover:text-white transition-all shadow-md"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Continue</span>
              </Link>
            ) : (
              <Link
                href={`/courses/${course.slug || course._id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-all"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


