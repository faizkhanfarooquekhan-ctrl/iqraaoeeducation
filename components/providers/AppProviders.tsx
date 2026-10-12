"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useAcademy } from "@/lib/store";
import { warmVoices } from "@/lib/speech";

function Toasts() {
  const toasts = useAcademy((state) => state.toasts);
  const dismiss = useAcademy((state) => state.dismissToast);
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border bg-[#120c22]/90 px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              toast.tone === "success"
                ? "border-emerald-400/40"
                : toast.tone === "error"
                  ? "border-rose-400/40"
                  : "border-violet-400/40"
            }`}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function LevelUp() {
  const level = useAcademy((state) => state.levelUpTo);
  const dismiss = useAcademy((state) => state.dismissLevelUp);
  return (
    <AnimatePresence>
      {level ? (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass max-w-sm rounded-3xl p-8 text-center"
          >
            <Sparkles className="mx-auto h-10 w-10 text-amber-300" />
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-amber-200">Level up</p>
            <h3 className="mt-2 text-4xl font-black text-gradient">Level {level}</h3>
            <p className="mt-2 text-sm text-slate-300">Your academy streak of effort just opened the next level.</p>
            <button type="button" onClick={dismiss} className="btn-primary mt-6 rounded-xl px-5 py-2 font-bold text-white">
              Continue
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setHydrated = useAcademy((state) => state.setHydrated);

  useEffect(() => {
    warmVoices();
    if (useAcademy.persist.hasHydrated()) setHydrated();
    const unsub = useAcademy.persist.onFinishHydration(() => setHydrated());
    const fallback = window.setTimeout(() => setHydrated(), 1200);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, [setHydrated]);

  return (
    <>
      {children}
      <Toasts />
      <LevelUp />
    </>
  );
}
