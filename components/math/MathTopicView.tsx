"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TOPIC_META, defaultTopicForClass, isQuizMode, type MathTopic } from "@/lib/data/math";
import { useAcademy } from "@/lib/store";
import { QuestionArena } from "@/components/math/QuestionArena";
import { PahadeBoard } from "@/components/math/PahadeBoard";
import { VideoGallery } from "@/components/math/VideoGallery";

export function MathTopicView({ topic }: { topic: MathTopic | "practice" | "test" }) {
  const params = useSearchParams();
  const student = useAcademy((state) => state.student);
  const requested = Number(params.get("class"));
  const classLevel = requested >= 1 && requested <= 10 ? requested : student?.classLevel ?? 5;
  const requestedTopic = params.get("topic");
  const quizTopic = (requestedTopic && requestedTopic in TOPIC_META && requestedTopic !== "videos"
    ? requestedTopic
    : defaultTopicForClass(classLevel)) as MathTopic;

  if (topic === "practice" || topic === "test" || isQuizMode(topic)) {
    const mode = topic === "test" ? "test" : "practice";
    const active = quizTopic === "videos" ? defaultTopicForClass(classLevel) : quizTopic;
    return <QuestionArena mode={mode} topic={active} classLevel={classLevel} />;
  }

  if (topic === "tables") return <PahadeBoard classLevel={classLevel} />;
  if (topic === "videos") return <VideoGallery classLevel={classLevel} />;

  const meta = TOPIC_META[topic];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/class/${classLevel}`} className="text-sm text-slate-400 hover:text-white">← Class {classLevel}</Link>
      <p className="mt-4 text-xs uppercase tracking-[0.28em] text-slate-400">{meta.classes} · {meta.hindi}</p>
      <h1 className="mt-2 text-5xl font-black text-gradient">{meta.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">{meta.summary}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href={`/math/practice?topic=${topic}&class=${classLevel}`} className="glass-card rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Practice mode</p>
          <h2 className="mt-2 text-2xl font-bold">10 questions, instant feedback</h2>
          <p className="mt-2 text-sm text-slate-400">Green or red as soon as you answer. Combos add extra XP.</p>
        </Link>
        <Link href={`/math/test?topic=${topic}&class=${classLevel}`} className="glass-card rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Test mode</p>
          <h2 className="mt-2 text-2xl font-bold">10 questions, then a report card</h2>
          <p className="mt-2 text-sm text-slate-400">No hints during the paper. XP and confetti at the end.</p>
        </Link>
      </div>
      {topic === "fractions" || topic === "decimals" ? <VideoGallery classLevel={classLevel} compact /> : null}
    </div>
  );
}
