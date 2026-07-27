"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, ShieldAlert } from "lucide-react";
import { EduCoreLoader } from "@/components/EduCoreLoader";

interface AuthBridgeProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "teacher" | "student")[];
  redirectTo?: string;
}

export const AuthBridge: React.FC<AuthBridgeProps> = ({
  children,
  allowedRoles,
  redirectTo = "/login",
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      // Unauthenticated user attempting to access protected route -> Redirect to login
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Role mismatch (e.g., student trying to access admin dashboard)
      if (user.role === "admin") router.replace("/admin/dashboard");
      else if (user.role === "teacher") router.replace("/teacher/dashboard");
      else router.replace("/student/dashboard");
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, redirectTo, router, pathname]);

  // Custom Branded Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <EduCoreLoader message="Authenticating Session & Permissions..." />
      </div>
    );
  }

  // Not authenticated or role mismatch -> Do not render protected children while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Protected Route</h3>
          <p className="text-xs text-slate-400">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">Access Restricted</h3>
          <p className="text-xs text-slate-400">You do not have permission to view this role dashboard.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
