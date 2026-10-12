"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Library, LogOut, Shield, Users } from "lucide-react";
import { TeamFooter } from "@/components/layout/TeamFooter";
import { MOCK_STUDENTS } from "@/lib/data/students";
import { TOPIC_META, type MathTopic } from "@/lib/data/math";
import type { LetterCount, SubjectKey } from "@/lib/data/words";
import { useAcademy } from "@/lib/store";

const TOPICS = Object.values(TOPIC_META).map((item) => item.key).filter((key) => key !== "videos");

export function AdminDesk() {
  const router = useRouter();
  const logout = useAcademy((state) => state.logout);
  const student = useAcademy((state) => state.student);
  const xp = useAcademy((state) => state.xp);
  const streak = useAcademy((state) => state.dailyStreak);
  const best = useAcademy((state) => state.bestTestScore);
  const customWords = useAcademy((state) => state.customWords);
  const customQuestions = useAcademy((state) => state.customQuestions);
  const addWord = useAcademy((state) => state.addCustomWord);
  const removeWord = useAcademy((state) => state.removeCustomWord);
  const addQuestion = useAcademy((state) => state.addCustomQuestion);
  const removeQuestion = useAcademy((state) => state.removeCustomQuestion);
  const pushToast = useAcademy((state) => state.pushToast);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<"roster" | "content">("roster");

  const rows = useMemo(() => {
    const live = student
      ? [{ id: "device", name: `${student.name} (this device)`, classLevel: student.classLevel, xp, mathScore: best, streak, city: "This browser" }]
      : [];
    return [...live, ...MOCK_STUDENTS].filter((row) => `${row.name} ${row.city} ${row.classLevel}`.toLowerCase().includes(query.toLowerCase()));
  }, [best, query, streak, student, xp]);

  function saveWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const word = String(data.get("word") ?? "").trim();
    const meaning = String(data.get("meaning") ?? "").trim();
    const hindiPron = String(data.get("hindiPron") ?? "").trim();
    if (!word || !meaning) return;
    addWord({
      subject: String(data.get("subject")) as SubjectKey,
      letters: Number(data.get("letters")) as LetterCount,
      word,
      meaning,
      hindiPron: hindiPron || word,
    });
    event.currentTarget.reset();
    pushToast("Word added to the live curriculum.", "success");
  }

  function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const prompt = String(data.get("prompt") ?? "").trim();
    const answer = String(data.get("answer") ?? "").trim();
    if (!prompt || !answer) return;
    addQuestion({
      topic: String(data.get("topic")) as MathTopic,
      prompt,
      answer,
    });
    event.currentTarget.reset();
    pushToast("Question added to the next quiz.", "success");
  }

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-3xl border border-cyan-400/20 bg-cyan-950/30 p-4">
          <div className="flex items-center gap-2 font-black">
            <Shield className="h-5 w-5 text-cyan-300" /> Admin
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-200/70">IQRA AOE control</p>
          <nav className="mt-6 space-y-2">
            <button type="button" onClick={() => setPanel("roster")} className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left ${panel === "roster" ? "bg-cyan-400/20" : "hover:bg-white/5"}`}>
              <Users className="h-4 w-4" /> Students
            </button>
            <button type="button" onClick={() => setPanel("content")} className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left ${panel === "content" ? "bg-cyan-400/20" : "hover:bg-white/5"}`}>
              <Library className="h-4 w-4" /> Manage content
            </button>
          </nav>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 text-sm text-rose-200"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <section>
          {panel === "roster" ? (
            <>
              <h1 className="text-3xl font-black text-cyan-100">Registered students</h1>
              <p className="mt-1 text-sm text-slate-400">XP, latest math test score out of 10, and current streak.</p>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or city" className="field mt-4 max-w-sm !px-4" />
              <div className="mt-4 overflow-x-auto rounded-3xl border border-white/10">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">XP</th>
                      <th className="px-4 py-3">Math test</th>
                      <th className="px-4 py-3">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-t border-white/10">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{row.name}</div>
                          <div className="text-xs text-slate-400">{row.city}</div>
                        </td>
                        <td className="px-4 py-3">{row.classLevel}</td>
                        <td className="px-4 py-3">{row.xp}</td>
                        <td className="px-4 py-3">{row.mathScore}/10</td>
                        <td className="px-4 py-3">{row.streak}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black text-cyan-100">Manage content</h1>
              <p className="mt-1 text-sm text-slate-400">New words and questions are stored on this browser and appear in the student modules.</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <form onSubmit={saveWord} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h2 className="font-bold">Add a word</h2>
                  <select name="subject" className="field mt-3 !px-4">
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="urdu">Urdu</option>
                  </select>
                  <select name="letters" className="field mt-3 !px-4">
                    <option value="2">2 letters</option>
                    <option value="3">3 letters</option>
                    <option value="4">4 letters</option>
                  </select>
                  <input name="word" required placeholder="Word" className="field mt-3 !px-4" />
                  <input name="meaning" required placeholder="Meaning" className="field mt-3 !px-4" />
                  <input name="hindiPron" placeholder="Hindi pronunciation (required for Urdu TTS)" className="field mt-3 !px-4" />
                  <button className="btn-primary mt-4 rounded-xl px-4 py-2 font-bold text-white" type="submit">Save word</button>
                </form>
                <form onSubmit={saveQuestion} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h2 className="font-bold">Add a math question</h2>
                  <select name="topic" className="field mt-3 !px-4">
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic}>{TOPIC_META[topic].title}</option>
                    ))}
                  </select>
                  <input name="prompt" required placeholder="Prompt" className="field mt-3 !px-4" />
                  <input name="answer" required placeholder="Correct answer" className="field mt-3 !px-4" />
                  <button className="btn-primary mt-4 rounded-xl px-4 py-2 font-bold text-white" type="submit">Save question</button>
                </form>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <ul className="space-y-2">
                  {customWords.map((word) => (
                    <li key={word.id} className="flex items-center justify-between rounded-2xl border border-white/10 px-3 py-2 text-sm">
                      <span>{word.word} · {word.meaning}</span>
                      <button type="button" onClick={() => removeWord(word.id)} className="text-rose-300">Remove</button>
                    </li>
                  ))}
                  {customWords.length === 0 ? <li className="text-sm text-slate-500">No custom words yet.</li> : null}
                </ul>
                <ul className="space-y-2">
                  {customQuestions.map((question) => (
                    <li key={question.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-3 py-2 text-sm">
                      <span>{question.prompt}</span>
                      <button type="button" onClick={() => removeQuestion(question.id)} className="text-rose-300">Remove</button>
                    </li>
                  ))}
                  {customQuestions.length === 0 ? <li className="text-sm text-slate-500">No custom questions yet.</li> : null}
                </ul>
              </div>
            </>
          )}
          <TeamFooter />
        </section>
      </div>
    </div>
  );
}
