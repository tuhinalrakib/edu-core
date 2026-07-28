import React from "react";
import Link from "next/link";
import { Star, Clock, BookOpen, Users, ArrowRight } from "lucide-react";
import { CourseType } from "@/lib/api";

interface CourseCardProps {
  course: CourseType;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const teacherName = typeof course.teacher === "object" && course.teacher?.name ? course.teacher.name : "EduCore Instructor";
  const teacherAvatar =
    typeof course.teacher === "object" && course.teacher?.avatar
      ? course.teacher.avatar
      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";

  const thumbnail =
    course.thumbnail ||
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800";

  const totalLessonsCount =
    course.totalLessons ||
    (Array.isArray(course.sections)
      ? course.sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0)
      : 0);

  const price = typeof course.price === "number" ? course.price : 0;
  const rating = typeof course.averageRating === "number" ? course.averageRating : 4.9;
  const reviews = typeof course.totalReviews === "number" ? course.totalReviews : 12;
  const students = typeof course.totalStudents === "number" ? course.totalStudents : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 bg-slate-900/60">
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
        {course.discountPrice && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
            Save ${(price - course.discountPrice).toFixed(0)}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs mb-2.5">
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-slate-500">({reviews})</span>
            </div>
            <span className="text-slate-400 text-[11px] font-medium">{course.level || "All Levels"}</span>
          </div>

          {/* Title */}
          <Link href={`/courses/${course.slug || course._id}`}>
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
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">
                {price === 0 ? "Free" : `$${course.discountPrice ? course.discountPrice.toFixed(2) : price.toFixed(2)}`}
              </span>
              {course.discountPrice && (
                <span className="text-xs text-slate-500 line-through">${price.toFixed(2)}</span>
              )}
            </div>

            <Link
              href={`/courses/${course.slug || course._id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-all"
            >
              <span>Enroll Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
