"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface EduCoreLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const EduCoreLoader: React.FC<EduCoreLoaderProps> = ({
  message = "Preparing Learning Experience...",
  fullScreen = false,
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      {/* Animated Brand Logo Container */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Rotating Glowing Ring */}
        <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 animate-spin opacity-75 blur-md" />
        <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-purple-400/40 animate-spin" style={{ animationDuration: "8s" }} />

        {/* Center Glass Panel with SVG Icon */}
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-slate-950/90 border border-purple-500/40 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <img src="/logo.svg" alt="EduCore LMS" className="w-12 h-12 animate-pulse" />
        </div>
      </div>

      {/* Title & Loading Text */}
      <div className="space-y-2 max-w-sm">
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-purple-400">
          <Sparkles className="w-3.5 h-3.5 animate-bounce" />
          <span>EduCore SaaS LMS</span>
        </div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {message}
          <span className="inline-block w-4 text-left font-mono">{dots}</span>
        </h3>
        <p className="text-[11px] text-slate-400">
          Next-Gen AI Learning Platform & Interactive Academy
        </p>
      </div>

      {/* Progress Bar Animation */}
      <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
        <div className="h-full bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full animate-pulse" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
