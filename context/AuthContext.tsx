"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserType, API_BASE_URL } from "@/lib/api";

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  login: (email: string, role?: "admin" | "teacher" | "student") => void;
  logout: () => void;
  switchRole: (role: "admin" | "teacher" | "student") => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>({
    id: "u-student",
    name: "Alex Rivera",
    email: "student@educore.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  });

  const [token, setToken] = useState<string | null>("mock_jwt_token");

  useEffect(() => {
    const storedUser = localStorage.getItem("educore_user");
    const storedToken = localStorage.getItem("educore_token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const login = (email: string, role: "admin" | "teacher" | "student" = "student") => {
    let mockUser: UserType;

    if (role === "admin" || email.includes("admin")) {
      mockUser = {
        id: "u-admin",
        name: "Super Admin",
        email: "admin@educore.com",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      };
    } else if (role === "teacher" || email.includes("teacher")) {
      mockUser = {
        id: "u-teacher",
        name: "Dr. Sarah Jenkins",
        email: "teacher@educore.com",
        role: "teacher",
        title: "Senior Full-Stack Instructor",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        earnings: 4520,
        withdrawBalance: 1200,
      };
    } else {
      mockUser = {
        id: "u-student",
        name: "Alex Rivera",
        email: "student@educore.com",
        role: "student",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      };
    }

    const newToken = "jwt_token_" + Date.now();
    setUser(mockUser);
    setToken(newToken);
    localStorage.setItem("educore_user", JSON.stringify(mockUser));
    localStorage.setItem("educore_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("educore_user");
    localStorage.removeItem("educore_token");
  };

  const switchRole = (newRole: "admin" | "teacher" | "student") => {
    login(user?.email || "user@educore.com", newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
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
