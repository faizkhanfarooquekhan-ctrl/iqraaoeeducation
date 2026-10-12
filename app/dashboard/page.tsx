"use client";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { StudentShell } from "@/components/layout/StudentShell";

export default function DashboardPage() {
  return (
    <StudentShell>
      <DashboardHome />
    </StudentShell>
  );
}
