"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  DollarSign,
  BookOpen,
  CheckCircle,
  XCircle,
  Plus,
  Percent,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { MOCK_COURSES } from "@/lib/api";
import { AdminCharts } from "@/components/charts/AdminCharts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "teachers" | "courses" | "coupons">("overview");

  const [coupons, setCoupons] = useState([
    { code: "WELCOME50", type: "Percentage", value: "50%", usage: "128 / 500", status: "Active" },
    { code: "EDUCORE10", type: "Fixed", value: "$10.00", usage: "45 / 1000", status: "Active" },
  ]);

  const [newCouponCode, setNewCouponCode] = useState("");

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setCoupons([
      ...coupons,
      { code: newCouponCode.toUpperCase(), type: "Percentage", value: "20%", usage: "0 / 100", status: "Active" },
    ]);
    setNewCouponCode("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Super Admin Console</span>
          <h1 className="text-3xl font-black text-white mt-1">Platform Operations & SaaS Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Approve courses, manage teacher accounts, issue coupons, and monitor platform revenue.</p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Platform Revenue" value="$38,450.00" icon={DollarSign} change="24%" gradient="from-emerald-600 to-teal-600" />
        <StatCard title="Admin Commission (20%)" value="$7,690.00" icon={TrendingUp} change="24%" gradient="from-purple-600 to-indigo-600" />
        <StatCard title="Total Students" value="25,410" icon={Users} change="14%" gradient="from-blue-600 to-cyan-600" />
        <StatCard title="Total Instructors" value="450" icon={ShieldAlert} gradient="from-rose-600 to-pink-600" />
      </div>

      {/* Recharts Analytics Charts */}
      <AdminCharts />

      {/* Admin Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeTab === "overview" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab("teachers")}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeTab === "teachers" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Teacher Management
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`text-xs font-bold pb-2 border-b-2 transition-all ${
            activeTab === "coupons" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Coupon System
        </button>
      </div>

      {/* OVERVIEW / PENDING APPROVALS */}
      {activeTab === "overview" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Pending Course Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Course</th>
                  <th className="p-3">Instructor</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
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
                    <td className="p-3">{course.teacher.name}</td>
                    <td className="p-3">{course.category}</td>
                    <td className="p-3 font-bold text-emerald-400">${course.price}</td>
                    <td className="p-3 text-right space-x-2">
                      <button className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30">
                        Approve
                      </button>
                      <button className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === "teachers" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Instructor Roster</h2>
          <div className="divide-y divide-slate-800 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-white">Dr. Sarah Jenkins</p>
                  <p className="text-slate-400">teacher@educore.com • Senior Full-Stack Instructor</p>
                </div>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded font-bold uppercase text-[10px]">
                Approved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {activeTab === "coupons" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Coupon Management</h2>
            <form onSubmit={handleAddCoupon} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="New Coupon (e.g. FLASH20)"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-rose-500"
              />
              <button type="submit" className="px-4 py-1.5 rounded-xl font-bold text-white gradient-button text-xs">
                + Create Coupon
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {coupons.map((c, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold text-rose-400">{c.code}</td>
                    <td className="p-3">{c.value}</td>
                    <td className="p-3">{c.usage}</td>
                    <td className="p-3">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
