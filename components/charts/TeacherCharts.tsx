"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ENROLLMENT_DATA = [
  { course: "React 19 SaaS", students: 1420 },
  { course: "UI/UX Design", students: 890 },
];

const QUIZ_SCORES_DATA = [
  { scoreRange: "90-100%", count: 450 },
  { scoreRange: "80-89%", count: 680 },
  { scoreRange: "70-79%", count: 210 },
  { scoreRange: "<70%", count: 80 },
];

export const TeacherCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Course Enrollment Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Course Enrollment Breakdown</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ENROLLMENT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="course" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="students" fill="#a855f7" radius={[8, 8, 0, 0]} name="Enrolled Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quiz Performance Histogram */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Student Quiz Performance</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={QUIZ_SCORES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="scoreRange" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Students Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
