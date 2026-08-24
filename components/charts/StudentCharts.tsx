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

interface StudentChartsProps {
  totalCompletedLessons?: number;
}

export const StudentCharts: React.FC<StudentChartsProps> = ({ totalCompletedLessons = 0 }) => {
  // Approximate dynamic minutes based on actual completed lessons (avg 20 min per lecture)
  const totalMinutes = totalCompletedLessons * 20;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Days order: Mon -> Sun
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Real day index for today (0 = Mon, 6 = Sun)
  const todayDayIdx = (new Date().getDay() + 6) % 7;
  const todayName = days[todayDayIdx];

  const [dailyData, setDailyData] = React.useState<{ day: string; minutes: number }[]>([]);

  React.useEffect(() => {
    if (totalCompletedLessons === 0) {
      setDailyData(days.map((day) => ({ day, minutes: 0 })));
      return;
    }

    try {
      const storedLogs = JSON.parse(localStorage.getItem("educore_daily_learning_minutes") || "{}");
      const hasStoredData = Object.keys(storedLogs).length > 0;

      if (hasStoredData) {
        setDailyData(
          days.map((day) => ({
            day,
            minutes: Number(storedLogs[day]) || 0,
          }))
        );
      } else {
        // If not explicitly logged yet, place the completed lessons on today
        setDailyData(
          days.map((day, idx) => ({
            day,
            minutes: idx === todayDayIdx ? totalMinutes : 0,
          }))
        );
      }
    } catch (e) {
      setDailyData(
        days.map((day, idx) => ({
          day,
          minutes: idx === todayDayIdx ? totalMinutes : 0,
        }))
      );
    }
  }, [totalCompletedLessons, totalMinutes, todayDayIdx]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">Learning Velocity</h3>
          <p className="text-xs text-slate-400">Total time spent on course lectures</p>
        </div>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          {totalCompletedLessons > 0 ? `${totalHours} Hours Logged` : "0 Hours Logged"}
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#ffffff",
              }}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorTime)"
              strokeWidth={2.5}
              name="Learning Time (mins)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
