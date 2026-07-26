"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const REVENUE_DATA = [
  { month: "Jan", revenue: 4200, commission: 840 },
  { month: "Feb", revenue: 6800, commission: 1360 },
  { month: "Mar", revenue: 9500, commission: 1900 },
  { month: "Apr", revenue: 14200, commission: 2840 },
  { month: "May", revenue: 21000, commission: 4200 },
  { month: "Jun", revenue: 38450, commission: 7690 },
];

const NEW_USERS_DATA = [
  { week: "W1", students: 420, teachers: 12 },
  { week: "W2", students: 680, teachers: 18 },
  { week: "W3", students: 1100, teachers: 24 },
  { week: "W4", students: 1850, teachers: 35 },
];

const TOP_TEACHERS_DATA = [
  { name: "Dr. Sarah Jenkins", value: 45, color: "#a855f7" },
  { name: "Alex Mercer", value: 25, color: "#3b82f6" },
  { name: "Elena Rostova", value: 18, color: "#10b981" },
  { name: "Marcus Vance", value: 12, color: "#f59e0b" },
];

export const AdminCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Area Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Platform Revenue Growth</h3>
            <p className="text-xs text-slate-400">Total gross sales vs Admin commission (20%)</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
            +38.5% MoM
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#a855f7" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} name="Total Sales ($)" />
              <Area type="monotone" dataKey="commission" stroke="#10b981" fillOpacity={1} fill="url(#colorComm)" strokeWidth={2} name="Admin Fee ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Users Registration Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Monthly User Growth</h3>
            <p className="text-xs text-slate-400">New student registrations per week</p>
          </div>
          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded">
            4,050 New Users
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={NEW_USERS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Students" />
              <Bar dataKey="teachers" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Teachers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
