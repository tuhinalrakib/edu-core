import React from "react";
import { AuthBridge } from "@/components/AuthBridge";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <AuthBridge allowedRoles={["teacher"]}>{children}</AuthBridge>;
}
