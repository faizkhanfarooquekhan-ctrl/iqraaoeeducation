"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AdminDesk } from "@/components/admin/AdminDesk";

export default function AdminPage() {
  return (
    <AuthGate role="admin">
      <AdminDesk />
    </AuthGate>
  );
}
