"use client";

import Link from "next/link";
import { planFor } from "@/lib/data/curriculum";
import { TOPIC_META } from "@/lib/data/math";
import { SUBJECTS } from "@/lib/data/words";

export function ClassView({ classLevel }: { classLevel: number }) {
  const plan = planFor(classLevel);
  if (!plan) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">← Academy</Link>
      <p className="mt-4 text-xs uppercase tracking-[0.3em] text-emerald-200">{plan.stage} · Maharashtra State Board</p>
      <h1 className="mt-2 text-5xl font-black text-gradient">Class {plan.classLevel}</h1>
      <p className="mt-3 max-w-3xl text-lg text-slate-200">{plan.title}</p>
      <p className="mt-2 max-w-3xl text-slate-400">{plan.board}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {plan.outcomes.map((outcome) => (
          <li key={outcome} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
            {outcome}
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-2xl font-bold">Mathematics</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {plan.topics.map((topic) => {
          const meta = TOPIC_META[topic];
          return (
            <Link key={topic} href={`/math/${topic}?class=${classLevel}`} className="glass-card rounded-3xl p-6">
              <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${meta.accent}`} />
              <h3 className="text-2xl font-bold">{meta.title}</h3>
              <p className="text-sm text-slate-400">{meta.hindi}</p>
              <p className="mt-2 text-sm text-slate-300">{meta.summary}</p>
            </Link>
          );
        })}
      </div>
      <h2 className="mt-10 text-2xl font-bold">Languages</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {SUBJECTS.map((subject) => (
          <Link key={subject.key} href={`/languages/${subject.key}`} className="glass-card rounded-3xl p-6">
            <div className={`mb-3 flex h-16 items-center text-4xl ${subject.key === "urdu" ? "urdu-mark" : ""}`}>{subject.native}</div>
            <h3 className="text-xl font-bold">{subject.label}</h3>
            <p className="mt-1 text-sm text-slate-400">2, 3, and 4 letter rhyme sets</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
