"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LogOut, Sparkles } from "lucide-react";
import { levelFromXp, xpIntoLevel } from "@/lib/gamification";
import { useAcademy } from "@/lib/store";

export function SiteHeader() {
  const pathname = usePathname();
  const role = useAcademy((state) => state.role);
  const xp = useAcademy((state) => state.xp);
  const streak = useAcademy((state) => state.dailyStreak);
  const logout = useAcademy((state) => state.logout);
  const level = levelFromXp(xp);
  const progress = xpIntoLevel(xp);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07060f]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-pink-500 to-emerald-400 text-sm font-black text-white shadow-glow">
            IQ
          </span>
          <span>
            <span className="block text-sm font-black tracking-wide">IQRA AOE</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-slate-400">Academy of Excellence</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/#about" className={`rounded-full px-3 py-1.5 ${pathname === "/" ? "text-white" : "text-slate-300"} hover:bg-white/10`}>
            About
          </Link>
          <Link href="/class/1" className="rounded-full px-3 py-1.5 text-slate-300 hover:bg-white/10">
            Classes
          </Link>
          {role === "student" ? (
            <>
              <Link href="/dashboard" className="rounded-full px-3 py-1.5 text-slate-300 hover:bg-white/10">
                Dashboard
              </Link>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-amber-100">
                <Sparkles className="h-3.5 w-3.5" /> Lv {level} · {xp} XP
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-orange-100">
                <Flame className="h-3.5 w-3.5" /> {streak}d
              </span>
              <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-white/10 sm:block" title="Progress to next level">
                <div className="h-full bg-gradient-to-r from-violet-400 to-pink-400" style={{ width: `${progress}%` }} />
              </div>
              <button type="button" onClick={logout} className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 px-3 py-1.5 text-rose-200 hover:bg-rose-500/20">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary rounded-full px-4 py-1.5 font-semibold text-white">
              Student login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
