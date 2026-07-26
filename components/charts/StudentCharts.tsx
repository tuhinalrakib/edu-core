"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LEARNING_TIME_DATA = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 90 },
  { day: "Wed", minutes: 60 },
  { day: "Thu", minutes: 120 },
  { day: "Fri", minutes: 75 },
  { day: "Sat", minutes: 150 },
  { day: "Sun", minutes: 80 },
];

export const StudentCharts: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Weekly Learning Velocity</h3>
          <p className="text-xs text-slate-400">Total time spent watching lessons (Minutes per day)</p>
        </div>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded">
          10.3 Hours This Week
        </span>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={LEARNING_TIME_DATA}>
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="minutes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTime)" strokeWidth={3} name="Learning Time (mins)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
