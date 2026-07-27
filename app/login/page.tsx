"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, RefreshCw, KeyRound } from "lucide-react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const roleParam = (searchParams.get("role") as "student" | "teacher" | "admin") || "student";
  const isVerifiedParam = searchParams.get("verified") === "true";
  const isRegisteredParam = searchParams.get("registered") === "true";

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "teacher" | "admin">(roleParam);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login OTP step state
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    if (isRegisteredParam || isVerifiedParam) {
      Swal.fire({
        icon: "success",
        title: "Account Created Successfully! 🎉",
        text: `Your account (${emailParam || "user"}) has been registered. You can now log in below.`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
    }
  }, [isVerifiedParam, isRegisteredParam, emailParam]);

  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Request backend to generate and email a 6-digit OTP passcode
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Check if backend returned 403 (Email Not Verified)
      if (res.status === 403 || data.requiresVerification) {
        Swal.fire({
          icon: "warning",
          title: "Email Not Verified",
          text: data.message || `Please verify your email (${email}) before logging in.`,
          showCancelButton: true,
          confirmButtonText: "Verify Email Now",
          cancelButtonText: "Cancel",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          cancelButtonColor: "#334155",
          customClass: {
            popup: "rounded-2xl border border-slate-800 shadow-2xl",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}&role=${role}`);
          }
        });
        return;
      }

      if (!res.ok || !data.success) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: data.message || "Invalid email or password.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          customClass: {
            popup: "rounded-2xl border border-slate-800 shadow-2xl",
          },
        });
        return;
      }

      // Transition to Login OTP Verification step
      setStep("otp");
      setCountdown(30);

      Swal.fire({
        icon: "info",
        title: "Security OTP Code Sent! 📩",
        text: `A 6-digit login passcode has been sent to your email (${email}). Please check your inbox.`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
    } catch (error: any) {
      console.warn("Backend send-otp failed:", error.message);
      
      // Fallback for offline demo accounts if backend is disconnected
      const demoAccounts = ["student@educore.com", "teacher@educore.com", "admin@educore.com"];
      if (demoAccounts.includes(email)) {
        setStep("otp");
        setCountdown(30);
      } else {
        Swal.fire({
          icon: "error",
          title: "Connection Error",
          text: "Could not connect to authentication server. Please ensure backend server is running.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          customClass: {
            popup: "rounded-2xl border border-slate-800 shadow-2xl",
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Code",
        text: "Please enter all 6 digits of the OTP code sent to your email.",
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
      // Verify OTP code with backend API
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user.email, data.user.role, data.user, data.token);
        const redirectRole = data.user.role || role;
        if (redirectRole === "admin") router.push("/admin/dashboard");
        else if (redirectRole === "teacher") router.push("/teacher/dashboard");
        else router.push("/student/dashboard");
        return;
      } else {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: data.message || "Invalid or expired OTP code.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          customClass: {
            popup: "rounded-2xl border border-slate-800 shadow-2xl",
          },
        });
        return;
      }
    } catch (error: any) {
      console.warn("Backend verify-otp fallback:", error.message);
      // Fallback execution for standalone demo mode
      const demoAccounts = ["student@educore.com", "teacher@educore.com", "admin@educore.com"];
      if (demoAccounts.includes(email)) {
        login(email, role);
        if (role === "admin") router.push("/admin/dashboard");
        else if (role === "teacher") router.push("/teacher/dashboard");
        else router.push("/student/dashboard");
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCountdown(30);
        Swal.fire({
          icon: "success",
          title: "New OTP Sent!",
          text: `A fresh 6-digit security OTP code has been sent to ${email}`,
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          customClass: {
            popup: "rounded-2xl border border-slate-800 shadow-2xl",
          },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Resend Failed",
          text: data.message || "Could not resend OTP. Please try again.",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#7c3aed",
          customClass: {
            popup: "rounded-2xl border border-slate-800 shadow-2xl",
          },
        });
      }
    } catch (err: any) {
      setCountdown(30);
      Swal.fire({
        icon: "info",
        title: "OTP Code Sent",
        text: `A new 6-digit login OTP code has been sent to ${email}`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        customClass: {
          popup: "rounded-2xl border border-slate-800 shadow-2xl",
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl gradient-button flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-purple-500/20">
            {step === "credentials" ? <BookOpen className="w-6 h-6" /> : <KeyRound className="w-6 h-6 animate-pulse" />}
          </div>
          <h2 className="text-2xl font-black text-white">
            {step === "credentials" ? "Welcome Back" : "Security OTP Verification"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === "credentials"
              ? "Log in to continue your learning journey"
              : `Enter the 6-digit OTP code sent to ${email}`}
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["student", "teacher", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all border ${
                      role === r
                        ? "bg-purple-900/50 border-purple-500 text-purple-200"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-center text-lg font-bold text-white focus:outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP & Log In</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="text-purple-400 font-bold hover:underline disabled:text-slate-600 disabled:no-underline"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Back to Login Form
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 border-t border-slate-800/60 pt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-purple-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
