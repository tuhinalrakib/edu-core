import React from "react";
import { AuthBridge } from "@/components/AuthBridge";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AuthBridge allowedRoles={["student", "teacher", "admin"]}>{children}</AuthBridge>;
}
