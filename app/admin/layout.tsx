import React from "react";
import { AuthBridge } from "@/components/AuthBridge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthBridge allowedRoles={["admin"]}>{children}</AuthBridge>;
}
