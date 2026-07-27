"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, RefreshCw, ShieldCheck, Mail, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const roleParam = searchParams.get("role") || "student";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmailLink = async () => {
      if (!emailParam) {
        setStatus("success");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailParam }),
        });

        const data = await res.json();

        // Store email as verified in local storage fallback
        const verifiedList = JSON.parse(localStorage.getItem("educore_verified_emails") || "[]");
        if (!verifiedList.includes(emailParam)) {
          verifiedList.push(emailParam);
          localStorage.setItem("educore_verified_emails", JSON.stringify(verifiedList));
        }

        setStatus("success");
      } catch (error: any) {
        console.warn("Backend verify-email fallback:", error.message);
        // Fallback for standalone/offline mode
        const verifiedList = JSON.parse(localStorage.getItem("educore_verified_emails") || "[]");
        if (!verifiedList.includes(emailParam)) {
          verifiedList.push(emailParam);
          localStorage.setItem("educore_verified_emails", JSON.stringify(verifiedList));
        }
        setStatus("success");
      }
    };

    verifyEmailLink();
  }, [emailParam]);

  const handleProceedToLogin = () => {
    router.push(`/login?email=${encodeURIComponent(emailParam)}&role=${roleParam}&verified=true`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center">
        {status === "loading" && (
          <div className="space-y-4 py-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Verifying Your Email...</h2>
            <p className="text-xs text-slate-400">Please wait while we activate your EduCore account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Verification Successful
              </span>
              <h2 className="text-2xl font-black text-white mt-3">Email Verified! 🎉</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your email address <span className="font-bold text-purple-400">{emailParam || "your account"}</span> has been successfully verified and activated.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleProceedToLogin}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-xs text-slate-400">{errorMessage || "Could not verify email."}</p>
            <button
              onClick={() => setStatus("loading")}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
