"use client";

import React from "react";
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
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MOCK_COURSES } from "@/lib/api";
import { TeacherCharts } from "@/components/charts/TeacherCharts";

export default function TeacherDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Teacher Studio</span>
          <h1 className="text-3xl font-black text-white mt-1">Instructor Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Create courses, grade student assignments, and track sales revenue.</p>
        </div>

        <Link
          href="/teacher/courses/create"
          className="px-6 py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Earnings" value="$4,520.00" icon={DollarSign} change="18%" gradient="from-blue-600 to-indigo-600" />
        <StatCard title="Enrolled Students" value="2,310" icon={Users} change="12%" gradient="from-purple-600 to-pink-600" />
        <StatCard title="Active Courses" value="2" icon={BookOpen} gradient="from-emerald-600 to-teal-600" />
        <StatCard title="Average Rating" value="4.8 ★" icon={Star} gradient="from-amber-500 to-rose-500" />
      </div>

      {/* Recharts Analytics */}
      <TeacherCharts />

      {/* Course Management Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Courses</h2>
          <Link href="/teacher/courses/create" className="text-xs font-bold text-purple-400 hover:underline">
            + Add New
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Course</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Students</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {MOCK_COURSES.map((course) => (
                <tr key={course._id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-white flex items-center gap-3">
                    <img src={course.thumbnail} alt={course.title} className="w-12 h-8 rounded object-cover" />
                    <span className="truncate max-w-xs">{course.title}</span>
                  </td>
                  <td className="p-3">{course.category}</td>
                  <td className="p-3 font-bold text-emerald-400">${course.price}</td>
                  <td className="p-3">{course.totalStudents}</td>
                  <td className="p-3">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Published
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-purple-400 cursor-pointer hover:underline">
                    Edit Course
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
