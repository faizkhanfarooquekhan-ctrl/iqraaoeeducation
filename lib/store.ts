"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomQuestion, MathTopic } from "@/lib/data/math";
import type { LetterCount, SubjectKey } from "@/lib/data/words";
import { levelFromXp, nextStreak, todayKey } from "@/lib/gamification";

export type StudentProfile = {
  name: string;
  dob: string;
  classLevel: number;
};

export type CustomWord = {
  id: string;
  subject: SubjectKey;
  letters: LetterCount;
  word: string;
  meaning: string;
  hindiPron: string;
};

type Toast = { id: string; message: string; tone: "success" | "error" | "info" };

type AcademyState = {
  hydrated: boolean;
  role: "student" | "admin" | null;
  student: StudentProfile | null;
  xp: number;
  dailyStreak: number;
  lastActiveDate: string | null;
  bestTestScore: number;
  testsTaken: number;
  levelUpTo: number | null;
  customWords: CustomWord[];
  customQuestions: CustomQuestion[];
  toasts: Toast[];
  setHydrated: () => void;
  loginStudent: () => void;
  loginAdmin: () => void;
  logout: () => void;
  saveProfile: (profile: StudentProfile) => void;
  touchDailyStreak: () => void;
  addXp: (amount: number) => void;
  dismissLevelUp: () => void;
  recordTest: (correct: number) => number;
  addCustomWord: (word: Omit<CustomWord, "id">) => void;
  removeCustomWord: (id: string) => void;
  addCustomQuestion: (question: Omit<CustomQuestion, "id"> & { topic: MathTopic }) => void;
  removeCustomQuestion: (id: string) => void;
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
};

function applyXp(xp: number, amount: number) {
  const before = levelFromXp(xp);
  const nextXp = xp + amount;
  const after = levelFromXp(nextXp);
  return { xp: nextXp, leveled: after > before ? after : null };
}

export const useAcademy = create<AcademyState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      role: null,
      student: null,
      xp: 0,
      dailyStreak: 0,
      lastActiveDate: null,
      bestTestScore: 0,
      testsTaken: 0,
      levelUpTo: null,
      customWords: [],
      customQuestions: [],
      toasts: [],
      setHydrated: () => set({ hydrated: true }),
      loginStudent: () => set({ role: "student" }),
      loginAdmin: () => set({ role: "admin" }),
      logout: () => set({ role: null }),
      saveProfile: (student) => set({ student }),
      touchDailyStreak: () => {
        const { dailyStreak, lastActiveDate } = get();
        const today = todayKey();
        if (lastActiveDate === today) return;
        set({
          dailyStreak: nextStreak(dailyStreak, lastActiveDate),
          lastActiveDate: today,
        });
      },
      addXp: (amount) => {
        if (amount <= 0) return;
        const { xp, levelUpTo } = get();
        const applied = applyXp(xp, amount);
        set({
          xp: applied.xp,
          levelUpTo: applied.leveled ?? levelUpTo,
        });
      },
      dismissLevelUp: () => set({ levelUpTo: null }),
      recordTest: (correct) => {
        const gained = correct * 20;
        const { xp, levelUpTo, bestTestScore, testsTaken } = get();
        const applied = applyXp(xp, gained);
        set({
          xp: applied.xp,
          levelUpTo: applied.leveled ?? levelUpTo,
          bestTestScore: Math.max(bestTestScore, correct),
          testsTaken: testsTaken + 1,
        });
        return gained;
      },
      addCustomWord: (word) =>
        set({
          customWords: [{ ...word, id: `word-${Date.now()}` }, ...get().customWords],
        }),
      removeCustomWord: (id) => set({ customWords: get().customWords.filter((word) => word.id !== id) }),
      addCustomQuestion: (question) =>
        set({
          customQuestions: [{ ...question, id: `q-${Date.now()}` }, ...get().customQuestions],
        }),
      removeCustomQuestion: (id) =>
        set({ customQuestions: get().customQuestions.filter((question) => question.id !== id) }),
      pushToast: (message, tone = "info") => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set({ toasts: [...get().toasts, { id, message, tone }] });
        if (typeof window !== "undefined") {
          window.setTimeout(() => get().dismissToast(id), 3400);
        }
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
    }),
    {
      name: "iqra-aoe-academy",
      partialize: (state) => ({
        role: state.role,
        student: state.student,
        xp: state.xp,
        dailyStreak: state.dailyStreak,
        lastActiveDate: state.lastActiveDate,
        bestTestScore: state.bestTestScore,
        testsTaken: state.testsTaken,
        customWords: state.customWords,
        customQuestions: state.customQuestions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
