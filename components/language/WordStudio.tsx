"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useAcademy } from "@/lib/store";
import { speakWord } from "@/lib/speech";
import { SUBJECTS, wordsFor, type LetterCount, type SubjectKey } from "@/lib/data/words";

const LENGTHS: LetterCount[] = [2, 3, 4];
const PAGE_SIZE = 10;

export function WordStudio({ subject }: { subject: SubjectKey }) {
  const meta = SUBJECTS.find((item) => item.key === subject)!;
  const customWords = useAcademy((state) => state.customWords);
  const addXp = useAcademy((state) => state.addXp);
  const role = useAcademy((state) => state.role);
  const [letters, setLetters] = useState<LetterCount>(2);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);

  const words = useMemo(
    () => wordsFor(subject, letters, customWords).filter((item) => {
      const blob = `${item.word} ${item.meaning} ${item.hindiPron}`.toLowerCase();
      return blob.includes(query.trim().toLowerCase());
    }),
    [subject, letters, customWords, query],
  );
  const pages = Math.max(1, Math.ceil(words.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = words.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function listen(id: string, item: (typeof words)[number]) {
    speakWord(subject, item);
    setActive(id);
    window.setTimeout(() => setActive((current) => (current === id ? null : current)), 1200);
    if (role === "student" && !heard.has(id)) {
      setHeard(new Set(heard).add(id));
      addXp(2);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href={role === "student" ? "/dashboard" : "/"} className="text-sm text-slate-400 hover:text-white">
        ← {role === "student" ? "Dashboard" : "Academy"}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{meta.blurb}</p>
          <h1 className={`mt-2 text-5xl font-black ${subject === "urdu" ? "urdu-font" : ""}`}>{meta.label}</h1>
          <p className="mt-2 max-w-xl text-slate-300">
            {words.length} rhyme cards in this set.
            {subject === "urdu" ? " Urdu is spoken with the Hindi transliteration on the hi-IN voice so the sound stays clear." : ""}
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Search a word"
          className="field !px-4"
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {LENGTHS.map((length) => (
          <button
            key={length}
            type="button"
            onClick={() => {
              setLetters(length);
              setPage(0);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${letters === length ? "btn-primary text-white" : "btn-ghost text-slate-200"}`}
          >
            {length}-letter words
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {slice.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`glass-card relative cursor-pointer rounded-3xl p-6 ${active === item.id ? "border-violet-400 shadow-glow" : ""}`}
            onClick={() => listen(item.id, item)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10"
              onClick={(event) => {
                event.stopPropagation();
                listen(item.id, item);
              }}
              aria-label={`Speak ${item.word}`}
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-pink-200">{item.rhyme}</p>
            <h2 className={`mt-2 text-4xl font-bold ${subject === "urdu" ? "urdu-font text-5xl" : ""}`}>{item.word}</h2>
            {subject === "urdu" ? <p className="mt-1 text-sm text-emerald-200">{item.hindiPron}</p> : null}
            <p className="mt-2 text-pink-200">[ {item.meaning} ]</p>
          </motion.article>
        ))}
      </div>
      {slice.length === 0 ? <p className="mt-8 text-center text-slate-400">No words match that search.</p> : null}
      <div className="mt-8 flex items-center justify-between">
        <button type="button" className="btn-ghost inline-flex items-center gap-2 rounded-xl px-4 py-2" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-sm text-slate-300">Page {safePage + 1} / {pages}</span>
        <button type="button" className="btn-ghost inline-flex items-center gap-2 rounded-xl px-4 py-2" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
