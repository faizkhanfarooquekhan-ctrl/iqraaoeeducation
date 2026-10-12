"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Trophy, XCircle } from "lucide-react";
import { celebrate } from "@/lib/confetti";
import { practiceXp } from "@/lib/gamification";
import { useAcademy } from "@/lib/store";
import { TOPIC_META, buildQuiz, type MathQuestion, type MathTopic, type QuizMode } from "@/lib/data/math";

type Review = { prompt: string; selected: string; answer: string; explanation: string };

export function QuestionArena({
  mode,
  topic,
  classLevel,
}: {
  mode: QuizMode;
  topic: MathTopic;
  classLevel: number;
}) {
  const customQuestions = useAcademy((state) => state.customQuestions);
  const role = useAcademy((state) => state.role);
  const addXp = useAcademy((state) => state.addXp);
  const recordTest = useAcademy((state) => state.recordTest);
  const pushToast = useAcademy((state) => state.pushToast);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    setQuestions(buildQuiz(topic, classLevel, 10, customQuestions));
    setIndex(0);
    setPicked(null);
    setCombo(0);
    setReviews([]);
    setDone(false);
    setEarned(0);
    lock.current = false;
  }, [topic, classLevel, mode, customQuestions]);

  const question = questions[index];
  const meta = TOPIC_META[topic];
  const correctCount = reviews.filter((item) => item.selected === item.answer).length;

  function finish(nextReviews: Review[]) {
    const correct = nextReviews.filter((item) => item.selected === item.answer).length;
    if (mode === "test") {
      const xp = recordTest(correct);
      setEarned(xp);
      void celebrate();
      pushToast(`Test complete. ${xp} XP added.`, "success");
    } else {
      pushToast("Practice set complete.", "info");
    }
    setDone(true);
  }

  function choose(option: string) {
    if (!question || picked || lock.current || done) return;
    lock.current = true;
    const correct = option === question.answer;
    setPicked(option);
    const nextCombo = mode === "practice" && correct ? Math.min(combo + 1, 3) : 0;
    if (mode === "practice") {
      setCombo(correct ? nextCombo : 0);
      const gain = practiceXp(correct, nextCombo);
      if (gain && role === "student") addXp(gain);
    }
    const entry = {
      prompt: question.prompt,
      selected: option,
      answer: question.answer,
      explanation: question.explanation,
    };
    window.setTimeout(() => {
      const nextReviews = [...reviews, entry];
      setReviews(nextReviews);
      setPicked(null);
      lock.current = false;
      if (index + 1 >= questions.length) finish(nextReviews);
      else setIndex(index + 1);
    }, mode === "practice" ? 1100 : 420);
  }

  if (!question && !done) {
    return <p className="px-4 py-16 text-center text-slate-400">Preparing questions…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/math/${topic}?class=${classLevel}`} className="text-sm text-slate-400 hover:text-white">← {meta.title}</Link>
        <span className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] ${mode === "test" ? "bg-rose-500/20 text-rose-200" : "bg-sky-500/20 text-sky-200"}`}>
          {mode === "test" ? "Test mode" : "Practice mode"}
        </span>
      </div>
      {done ? (
        <div className="glass rounded-[2rem] p-8 text-center">
          <Trophy className="mx-auto h-14 w-14 text-amber-300" />
          <h1 className="mt-3 text-4xl font-black">{mode === "test" ? "Report card" : "Practice complete"}</h1>
          <p className="mt-2 text-slate-300">{meta.title} · Class {classLevel}</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4">
              <div className="text-3xl font-black text-emerald-300">{correctCount}</div>
              <div className="text-xs uppercase tracking-widest text-emerald-100">Correct</div>
            </div>
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4">
              <div className="text-3xl font-black text-rose-300">{reviews.length - correctCount}</div>
              <div className="text-xs uppercase tracking-widest text-rose-100">Wrong</div>
            </div>
          </div>
          {mode === "test" ? <p className="mt-4 text-lg font-semibold text-amber-200">+{earned} XP</p> : null}
          <ul className="mt-6 space-y-2 text-left text-sm">
            {reviews.map((item, itemIndex) => {
              const ok = item.selected === item.answer;
              return (
                <li key={`${item.prompt}-${itemIndex}`} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="font-semibold">{item.prompt}</p>
                  <p className={ok ? "text-emerald-300" : "text-rose-300"}>
                    Your answer: {item.selected} {ok ? "" : `· Correct: ${item.answer}`}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-primary rounded-xl px-5 py-2 font-bold text-white"
              onClick={() => {
                setQuestions(buildQuiz(topic, classLevel, 10, customQuestions));
                setIndex(0);
                setReviews([]);
                setDone(false);
                setEarned(0);
                setCombo(0);
              }}
            >
              Try again
            </button>
            <Link href="/dashboard" className="btn-ghost rounded-xl px-5 py-2 font-bold">Dashboard</Link>
          </div>
        </div>
      ) : (
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Question {index + 1} / {questions.length}</span>
            {mode === "practice" ? <span>Combo {"★".repeat(combo)}{"☆".repeat(3 - combo)}</span> : <span>Answers stay hidden</span>}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-violet-400 via-pink-400 to-emerald-400" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <h1 className="mt-8 text-center text-3xl font-black md:text-4xl">{question.prompt}</h1>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => {
              const letter = String.fromCharCode(65 + optionIndex);
              const show = mode === "practice" && picked;
              const isAnswer = option === question.answer;
              const isPicked = option === picked;
              const tone = !show
                ? "border-white/10 bg-white/5"
                : isAnswer
                  ? "border-emerald-400/70 bg-emerald-500/20"
                  : isPicked
                    ? "border-rose-400/70 bg-rose-500/20"
                    : "border-white/10 bg-white/5 opacity-60";
              return (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(picked)}
                  onClick={() => choose(option)}
                  className={`rounded-2xl border px-4 py-4 text-left text-lg font-bold transition hover:-translate-y-0.5 ${tone}`}
                >
                  <span className="mr-3 text-slate-400">{letter}.</span>
                  {option}
                </button>
              );
            })}
          </div>
          <div className="mt-6 min-h-10 text-center text-lg font-semibold">
            {mode === "practice" && picked ? (
              picked === question.answer ? (
                <span className="inline-flex items-center gap-2 text-emerald-300"><CheckCircle2 /> {combo >= 3 ? "Combo! +25 XP" : "Correct · +10 XP"}</span>
              ) : (
                <span className="inline-flex items-center gap-2 text-rose-300"><XCircle /> {question.explanation}</span>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
