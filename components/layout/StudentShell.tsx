"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function StudentShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate role="student">
      <SiteHeader />
      <main>{children}</main>
    </AuthGate>
  );
}
