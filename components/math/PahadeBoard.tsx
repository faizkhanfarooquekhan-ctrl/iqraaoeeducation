"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2 } from "lucide-react";
import { hindiNumber, pahadeLine, pahadeScript } from "@/lib/data/hindiNumbers";
import { speak } from "@/lib/speech";
import { useAcademy } from "@/lib/store";

const TABLES = Array.from({ length: 19 }, (_, index) => index + 2);

export function PahadeBoard({ classLevel }: { classLevel: number }) {
  const [table, setTable] = useState(2);
  const pushToast = useAcademy((state) => state.pushToast);

  function readAloud() {
    speak(pahadeScript(table), "hi-IN");
    pushToast(`Reading the table of ${table} in Hindi.`, "info");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/class/${classLevel}`} className="text-sm text-slate-400 hover:text-white">← Class {classLevel}</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Maharashtra primary · पहाड़े</p>
          <h1 className="text-4xl font-black text-gradient">Table of {table}</h1>
          <p className="mt-2 text-slate-300">{hindiNumber(table)} का पहाड़ा · spoken with the hi-IN voice.</p>
        </div>
        <button type="button" onClick={readAloud} className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold text-white">
          <Volume2 className="h-4 w-4" /> Listen
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {TABLES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTable(value)}
            className={`h-11 w-11 rounded-xl border font-bold ${value === table ? "border-emerald-300 bg-emerald-500/30" : "border-white/10 bg-white/5"}`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="glass mt-6 rounded-[2rem] p-6 md:p-8">
        <ol className="space-y-3 text-2xl">
          {Array.from({ length: 10 }, (_, step) => step + 1).map((step) => (
            <li key={step} className="flex flex-wrap items-center justify-center gap-3 font-semibold">
              <span className="w-10 text-right text-slate-300">{table}</span>
              <span className="text-pink-300">×</span>
              <span className="w-8 text-center">{step}</span>
              <span className="text-pink-300">=</span>
              <span className="w-16 text-white">{table * step}</span>
              <span className="text-sm text-emerald-200">{pahadeLine(table, step)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
