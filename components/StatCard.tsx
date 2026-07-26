import React from "react";
import { LucideIcon, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  gradient = "from-purple-600 to-indigo-600",
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between relative overflow-hidden group">
      <div className="relative z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {isPositive ? "+" : ""}{change}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">vs last month</span>
          </div>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};
