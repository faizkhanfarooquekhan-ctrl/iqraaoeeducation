"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginCard } from "@/components/auth/LoginCard";
import { ADMIN_ID, ADMIN_PASSWORD, safeNext, verifyAdmin } from "@/lib/auth";
import { useAcademy } from "@/lib/store";

function AdminLoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const role = useAcademy((state) => state.role);
  const hydrated = useAcademy((state) => state.hydrated);
  const loginAdmin = useAcademy((state) => state.loginAdmin);
  const pushToast = useAcademy((state) => state.pushToast);
  const next = safeNext(params.get("next"), "/admin");

  useEffect(() => {
    if (hydrated && role === "admin") router.replace(next);
  }, [hydrated, next, role, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] px-4 py-10">
      <LoginCard
        eyebrow="Restricted"
        title="Admin access"
        hint={{ id: ADMIN_ID, password: ADMIN_PASSWORD }}
        submitLabel="Open admin panel"
        onSubmit={(id, password) => {
          if (!verifyAdmin(id, password)) return "Those admin credentials were not recognised.";
          loginAdmin();
          pushToast("Admin session started.", "success");
          router.push(next);
          return null;
        }}
      />
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center">Opening admin login…</main>}>
      <AdminLoginScreen />
    </Suspense>
  );
}
