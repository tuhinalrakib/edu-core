"use client";

import React, { useState } from "react";
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
  Share2,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MOCK_COURSES } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const course = MOCK_COURSES.find(
    (c) => c.slug === params.courseId || c._id === params.courseId
  ) || MOCK_COURSES[0];

  const [expandedSection, setExpandedSection] = useState<string | null>(course.sections[0]?._id || null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState("");

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME50") {
      setAppliedDiscount(50);
      setCouponMsg("50% OFF Coupon applied successfully!");
    } else {
      setCouponMsg("Invalid coupon code.");
    }
  };

  const handleEnroll = () => {
    // Navigate straight into player or student dashboard
    router.push(`/student/learn/${course.slug || course._id}`);
  };

  return (
    <div className="min-h-screen py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <span>{course.category}</span> • <span>{course.level}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {course.shortDescription || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-2">
              <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold">{course.averageRating}</span>
                <span className="text-slate-400">({course.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{course.totalStudents} enrolled students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{course.language}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <img
                src={course.teacher.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                alt={course.teacher.name}
                className="w-10 h-10 rounded-full border-2 border-purple-500/40"
              />
              <div>
                <p className="text-xs text-slate-400">Created by</p>
                <p className="text-sm font-bold text-white">{course.teacher.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Purchase Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details, Curriculum, Instructor */}
          <div className="lg:col-span-2 space-y-12">
            {/* Learning Outcomes */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                {course.learningOutcomes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Course Curriculum</h3>
                <span className="text-xs text-slate-400">
                  {course.sections.length} Sections • {course.totalLessons} Lessons • {course.totalDurationMinutes}m total
                </span>
              </div>

              <div className="space-y-3">
                {course.sections.map((section, idx) => {
                  const isOpen = expandedSection === section._id;
                  return (
                    <div key={idx} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(isOpen ? null : section._id || null)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/60 transition-colors"
                      >
                        <span className="text-sm font-bold text-white">{section.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{section.lessons.length} lessons</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-slate-950/40">
                          {section.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className="p-3.5 flex items-center justify-between text-xs text-slate-300">
                              <div className="flex items-center gap-3">
                                <Play className="w-3.5 h-3.5 text-purple-400" />
                                <span>{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {lesson.isFreePreview && (
                                  <span className="text-[10px] font-bold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
                                    Free Preview
                                  </span>
                                )}
                                <span className="text-slate-500">{lesson.durationMinutes} mins</span>
                              </div>
                            </div>
                          ))}
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
                src={course.teacher.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                alt={course.teacher.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/40"
              />
              <div>
                <h4 className="text-lg font-bold text-white">{course.teacher.name}</h4>
                <p className="text-xs text-purple-400 font-medium mb-2">{course.teacher.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{course.teacher.bio}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Action Card */}
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

              {/* Action Buttons */}
              <button
                onClick={handleEnroll}
                className="w-full py-4 rounded-xl text-sm font-bold text-white gradient-button shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <span>Enroll & Start Learning Now</span>
              </button>

              {/* Guarantee list */}
              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Full Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
