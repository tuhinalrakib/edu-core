"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Password validation rules
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      Swal.fire({
        icon: "error",
        title: "Weak Password",
        html: `
          <div style="text-align: left; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
            Password must satisfy the following criteria:
            <ul style="margin-top: 8px; list-style: none; padding-left: 0;">
              <li style="color: ${hasUppercase ? "#4ade80" : "#f87171"}">${hasUppercase ? "✓" : "✗"} At least 1 uppercase letter (A-Z)</li>
              <li style="color: ${hasLowercase ? "#4ade80" : "#f87171"}">${hasLowercase ? "✓" : "✗"} At least 1 lowercase letter (a-z)</li>
              <li style="color: ${hasNumber ? "#4ade80" : "#f87171"}">${hasNumber ? "✓" : "✗"} At least 1 number (0-9)</li>
              <li style="color: ${hasSpecialChar ? "#4ade80" : "#f87171"}">${hasSpecialChar ? "✓" : "✗"} At least 1 special character (!@#$...)</li>
            </ul>
          </div>
        `,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match! Please check and try again.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Hit Backend Auth Registration Route
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Account registration failed. Please try again.");
      }

      Swal.fire({
        icon: "success",
        title: "Account Created! 🎉",
        text: data.message || "Registration successful! Redirecting to login...",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      }).then(() => {
        router.push(`/login?email=${encodeURIComponent(email)}&role=${role}&registered=true`);
      });
    } catch (error: any) {
      // Fallback or error message
      console.warn("Backend registration error:", error.message);
      
      // If backend is running standalone or offline, notify user or proceed
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message || "Could not connect to backend server.",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center text-white mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Create EduCore Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join thousands of students and instructors</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">I want to register as</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                  role === "student"
                    ? "bg-purple-900/50 border-purple-500 text-purple-200"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                  role === "teacher"
                    ? "bg-blue-900/50 border-blue-500 text-blue-200"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                👨‍🏫 Teacher
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  {hasUppercase ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  {hasLowercase ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  {hasNumber ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  {hasSpecialChar ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <X className="w-3 h-3 text-slate-500 shrink-0" />}
                  <span>Special char (!@#$)</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full bg-slate-900 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                  confirmPassword && confirmPassword !== password
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-800 focus:border-purple-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
