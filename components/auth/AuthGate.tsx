"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAcademy } from "@/lib/store";

export function AuthGate({ role, children }: { role: "student" | "admin"; children: React.ReactNode }) {
  const current = useAcademy((state) => state.role);
  const hydrated = useAcademy((state) => state.hydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated || current === role) return;
    const next = encodeURIComponent(pathname);
    router.replace(role === "admin" ? `/admin-login?next=${next}` : `/login?next=${next}`);
  }, [current, hydrated, pathname, role, router]);

  if (!hydrated || current !== role) {
    return <div className="grid min-h-[50vh] place-items-center text-slate-400">Checking your pass…</div>;
  }

  return children;
}
