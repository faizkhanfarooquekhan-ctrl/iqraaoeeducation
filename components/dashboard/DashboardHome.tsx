"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Sigma, Sparkles } from "lucide-react";
import { TeamFooter } from "@/components/layout/TeamFooter";
import { levelFromXp, xpIntoLevel } from "@/lib/gamification";
import { defaultTopicForClass } from "@/lib/data/math";
import { SUBJECTS } from "@/lib/data/words";
import { useAcademy } from "@/lib/store";

export function DashboardHome() {
  const student = useAcademy((state) => state.student);
  const saveProfile = useAcademy((state) => state.saveProfile);
  const xp = useAcademy((state) => state.xp);
  const streak = useAcademy((state) => state.dailyStreak);
  const best = useAcademy((state) => state.bestTestScore);
  const touch = useAcademy((state) => state.touchDailyStreak);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student?.name ?? "");
  const [dob, setDob] = useState(student?.dob ?? "");
  const [classLevel, setClassLevel] = useState(student?.classLevel ?? 5);

  useEffect(() => {
    touch();
  }, [touch]);

  useEffect(() => {
    if (!student) setEditing(true);
  }, [student]);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !dob) return;
    saveProfile({ name: name.trim(), dob, classLevel });
    setEditing(false);
  }

  const level = levelFromXp(xp);
  const activeClass = student?.classLevel ?? classLevel;
  const topic = defaultTopicForClass(activeClass);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Student dashboard</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">
            Welcome, <span className="text-gradient">{student?.name ?? "scholar"}</span>
          </h1>
          <p className="mt-2 text-slate-300">Class {activeClass} · Maharashtra State Board path</p>
        </div>
        <button type="button" onClick={() => setEditing(true)} className="btn-ghost rounded-xl px-4 py-2 text-sm">
          Edit profile
        </button>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="glass rounded-3xl p-5">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <p className="mt-3 text-sm text-slate-400">Level {level}</p>
          <p className="text-3xl font-black">{xp} XP</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-violet-400 to-pink-400" style={{ width: `${xpIntoLevel(xp)}%` }} />
          </div>
        </article>
        <article className="glass rounded-3xl p-5">
          <Flame className="h-5 w-5 text-orange-300" />
          <p className="mt-3 text-sm text-slate-400">Daily streak</p>
          <p className="text-3xl font-black">{streak} day{streak === 1 ? "" : "s"}</p>
        </article>
        <article className="glass rounded-3xl p-5">
          <Sigma className="h-5 w-5 text-emerald-300" />
          <p className="mt-3 text-sm text-slate-400">Best math test</p>
          <p className="text-3xl font-black">{best}/10</p>
        </article>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUBJECTS.map((subject) => (
          <Link key={subject.key} href={`/languages/${subject.key}`} className="glass-card rounded-3xl p-6">
            <div className={`flex h-16 items-end text-5xl ${subject.key === "urdu" ? "urdu-mark" : ""}`}>{subject.native}</div>
            <h2 className="mt-3 text-2xl font-bold">{subject.label}</h2>
            <p className="text-sm text-slate-400">{subject.blurb}</p>
          </Link>
        ))}
        <Link href={`/math/${topic}?class=${activeClass}`} className="glass-card rounded-3xl bg-gradient-to-br from-pink-500/10 to-violet-500/10 p-6">
          <div className="text-5xl">∑</div>
          <h2 className="mt-3 text-2xl font-bold text-pink-200">Mathematics</h2>
          <p className="text-sm text-slate-400">Practice, tests, tables, and videos for Class {activeClass}.</p>
        </Link>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/class/${activeClass}`} className="btn-primary rounded-2xl px-5 py-3 font-bold text-white">
          Open Class {activeClass}
        </Link>
        <Link href={`/math/practice?topic=${topic}&class=${activeClass}`} className="btn-ghost rounded-2xl px-5 py-3 font-bold">
          Practice now
        </Link>
        <Link href={`/math/test?topic=${topic}&class=${activeClass}`} className="btn-ghost rounded-2xl px-5 py-3 font-bold">
          Start a test
        </Link>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((levelNumber) => (
          <Link
            key={levelNumber}
            href={`/class/${levelNumber}`}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border font-bold ${
              levelNumber === activeClass ? "border-pink-300 bg-pink-500/20" : "border-white/10 bg-white/5"
            }`}
          >
            {levelNumber}
          </Link>
        ))}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <form onSubmit={save} className="glass w-full max-w-md rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Your academy profile</h2>
            <p className="mt-1 text-sm text-slate-400">This stays on this device and tunes the Class 1–10 syllabus.</p>
            <input className="field mt-5 !px-4" placeholder="Student name" value={name} onChange={(event) => setName(event.target.value)} required />
            <label className="mt-4 block text-xs uppercase tracking-widest text-slate-400">
              Date of birth
              <input className="field mt-1 !px-4" type="date" value={dob} onChange={(event) => setDob(event.target.value)} required />
            </label>
            <label className="mt-4 block text-xs uppercase tracking-widest text-slate-400">
              Class
              <select className="field mt-1 !px-4" value={classLevel} onChange={(event) => setClassLevel(Number(event.target.value))}>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value} className="bg-slate-900">Class {value}</option>
                ))}
              </select>
            </label>
            <div className="mt-5 flex gap-2">
              <button type="submit" className="btn-primary flex-1 rounded-xl py-3 font-bold text-white">Enter academy</button>
              {student ? (
                <button type="button" className="btn-ghost rounded-xl px-4" onClick={() => setEditing(false)}>
                  Close
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}

      <TeamFooter />
    </div>
  );
}
