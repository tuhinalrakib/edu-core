import React from "react";
import Link from "next/link";
import { Star, Clock, BookOpen, Users, ArrowRight } from "lucide-react";
import { CourseType } from "@/lib/api";

interface CourseCardProps {
  course: CourseType;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 bg-slate-900/60">
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-purple-900/80 backdrop-blur-md text-purple-200 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {course.category}
        </div>
        {course.discountPrice && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
            Save ${(course.price - course.discountPrice).toFixed(0)}
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
              <span>{course.averageRating.toFixed(1)}</span>
              <span className="text-slate-500">({course.totalReviews})</span>
            </div>
            <span className="text-slate-400 text-[11px] font-medium">{course.level}</span>
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
              src={course.teacher.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
              alt={course.teacher.name}
              className="w-6 h-6 rounded-full object-cover border border-purple-500/30"
            />
            <span className="text-xs text-slate-400 font-medium truncate">{course.teacher.name}</span>
          </div>
        </div>

        {/* Metadata footer */}
        <div className="border-t border-slate-800/80 pt-4 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>{course.totalLessons} Lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{course.totalStudents} Students</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">
                ${course.discountPrice ? course.discountPrice.toFixed(2) : course.price.toFixed(2)}
              </span>
              {course.discountPrice && (
                <span className="text-xs text-slate-500 line-through">${course.price.toFixed(2)}</span>
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
