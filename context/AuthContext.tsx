"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserType, API_BASE_URL } from "@/lib/api";

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isDemo: boolean;
  isLoading: boolean;
  enrolledCourseIds: string[];
  isCourseEnrolled: (courseIdOrSlug?: string) => boolean;
  refreshEnrolledCourses: (activeToken?: string | null) => Promise<void>;
  login: (email: string, role?: "admin" | "teacher" | "student", backendUser?: UserType, backendToken?: string) => void;
  logout: () => void;
  clearDemoSession: () => void;
  updateUser: (updatedFields: Partial<UserType>) => void;
  switchRole: (role: "admin" | "teacher" | "student") => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  const refreshEnrolledCourses = async (activeToken?: string | null) => {
    const t = activeToken !== undefined ? activeToken : token || (typeof window !== "undefined" ? localStorage.getItem("educore_token") || localStorage.getItem("token") : null);
    if (!t) return;
    try {
      const res = await fetch(`${API_BASE_URL}/student/courses`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.enrolledCourseIds)) {
          setEnrolledCourseIds(data.enrolledCourseIds);
          try {
            const currentLocal: string[] = JSON.parse(localStorage.getItem("educore_enrolled_courses") || "[]");
            const merged = Array.from(new Set([...currentLocal, ...data.enrolledCourseIds]));
            localStorage.setItem("educore_enrolled_courses", JSON.stringify(merged));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("Backend fetch enrolled courses:", e);
    }
  };

  const isCourseEnrolled = (courseIdOrSlug?: string): boolean => {
    if (!courseIdOrSlug) return false;
    const str = String(courseIdOrSlug).toLowerCase();
    return enrolledCourseIds.some((id) => String(id).toLowerCase() === str);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("educore_user");
    const storedToken = localStorage.getItem("educore_token") || localStorage.getItem("token");
    const storedIsDemo = localStorage.getItem("educore_is_demo");

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
        setIsDemo(storedIsDemo === "true");

        // Populate initial enrolled IDs from stored user if available
        if (Array.isArray(parsed.enrolledCourses)) {
          const initialIds = parsed.enrolledCourses.map((c: any) =>
            typeof c === "object" && c !== null ? c._id || c.slug : String(c)
          );
          setEnrolledCourseIds(initialIds);
        }

        refreshEnrolledCourses(storedToken);
      } catch (e) {
        console.error("Auth hydration error:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (
    email: string,
    role: "admin" | "teacher" | "student" = "student",
    backendUser?: UserType,
    backendToken?: string
  ) => {
    let mockUser: UserType;

    if (backendUser) {
      mockUser = backendUser;
    } else if (role === "admin" || email.includes("admin")) {
      mockUser = {
        id: "u-admin",
        name: "Super Admin",
        email: "admin@educore.com",
        role: "admin",
        avatar: "",
      };
    } else if (role === "teacher" || email.includes("teacher")) {
      mockUser = {
        id: "u-teacher",
        name: "Dr. Sarah Jenkins",
        email: "teacher@educore.com",
        role: "teacher",
        title: "Senior Full-Stack Instructor",
        avatar: "",
        earnings: 4520,
        withdrawBalance: 1200,
      };
    } else {
      mockUser = {
        id: "u-student",
        name: "Alex Rivera",
        email: "student@educore.com",
        role: "student",
        avatar: "",
      };
    }

    const newToken = backendToken || "jwt_token_" + Date.now();
    setUser(mockUser);
    setToken(newToken);
    setIsDemo(false);
    localStorage.setItem("educore_user", JSON.stringify(mockUser));
    localStorage.setItem("educore_token", newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("educore_is_demo", "false");

    if (backendToken) {
      refreshEnrolledCourses(backendToken);
    }
  };

  const switchRole = (newRole: "admin" | "teacher" | "student") => {
    let mockUser: UserType;

    if (newRole === "admin") {
      mockUser = {
        id: "u-admin",
        name: "Super Admin",
        email: "admin@educore.com",
        role: "admin",
        avatar: "",
      };
    } else if (newRole === "teacher") {
      mockUser = {
        id: "u-teacher",
        name: "Dr. Sarah Jenkins",
        email: "teacher@educore.com",
        role: "teacher",
        title: "Senior Full-Stack Instructor",
        avatar: "",
        earnings: 4520,
        withdrawBalance: 1200,
      };
    } else {
      mockUser = {
        id: "u-student",
        name: "Alex Rivera",
        email: "student@educore.com",
        role: "student",
        avatar: "",
      };
    }

    const newToken = "demo_jwt_token_" + Date.now();
    setUser(mockUser);
    setToken(newToken);
    setIsDemo(true);
    localStorage.setItem("educore_user", JSON.stringify(mockUser));
    localStorage.setItem("educore_token", newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("educore_is_demo", "true");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsDemo(false);
    setEnrolledCourseIds([]);
    localStorage.removeItem("educore_user");
    localStorage.removeItem("educore_token");
    localStorage.removeItem("token");
    localStorage.removeItem("educore_is_demo");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const clearDemoSession = () => {
    setUser(null);
    setToken(null);
    setIsDemo(false);
    setEnrolledCourseIds([]);
    localStorage.removeItem("educore_user");
    localStorage.removeItem("educore_token");
    localStorage.removeItem("token");
    localStorage.removeItem("educore_is_demo");
  };

  const updateUser = (updatedFields: Partial<UserType>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem("educore_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isDemo,
        isLoading,
        enrolledCourseIds,
        isCourseEnrolled,
        refreshEnrolledCourses,
        login,
        logout,
        clearDemoSession,
        updateUser,
        switchRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
