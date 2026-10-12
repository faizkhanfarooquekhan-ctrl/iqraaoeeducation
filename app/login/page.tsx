"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginCard } from "@/components/auth/LoginCard";
import { STUDENT_ID, STUDENT_PASSWORD, safeNext, verifyStudent } from "@/lib/auth";
import { useAcademy } from "@/lib/store";

function LoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const role = useAcademy((state) => state.role);
  const hydrated = useAcademy((state) => state.hydrated);
  const loginStudent = useAcademy((state) => state.loginStudent);
  const pushToast = useAcademy((state) => state.pushToast);
  const next = safeNext(params.get("next"), "/dashboard");

  useEffect(() => {
    if (hydrated && role === "student") router.replace(next);
  }, [hydrated, next, role, router]);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <LoginCard
        eyebrow="Student portal"
        title="Sign in"
        hint={{ id: STUDENT_ID, password: STUDENT_PASSWORD }}
        submitLabel="Secure login"
        onSubmit={(id, password) => {
          if (!verifyStudent(id, password)) return "Invalid Login ID or password.";
          loginStudent();
          pushToast("Login successful.", "success");
          router.push(next);
          return null;
        }}
      />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center">Opening login…</main>}>
      <LoginScreen />
    </Suspense>
  );
}
