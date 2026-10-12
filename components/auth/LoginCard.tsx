"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LockKeyhole, UserRound } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  hint: { id: string; password: string };
  submitLabel: string;
  onSubmit: (id: string, password: string) => string | null;
};

export function LoginCard({ eyebrow, title, hint, submitLabel, onSubmit }: Props) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = onSubmit(id, password);
    if (message) {
      setError(message);
      setShake((value) => value + 1);
      return;
    }
    setError(null);
  }

  return (
    <motion.form
      key={shake}
      onSubmit={handleSubmit}
      animate={error ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="glass relative w-full max-w-md overflow-hidden rounded-[2rem] p-8 md:p-10"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-violet-600/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-pink-600/30 blur-3xl" />
      <Link href="/" className="relative text-xs uppercase tracking-[0.28em] text-slate-400">
        ← IQRA AOE
      </Link>
      <p className="relative mt-6 text-xs uppercase tracking-[0.32em] text-pink-200">{eyebrow}</p>
      <h1 className="relative mt-2 text-4xl font-black text-gradient">{title}</h1>
      <label className="relative mt-8 block">
        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
        <input className="field" value={id} onChange={(event) => setId(event.target.value)} placeholder="Login ID" autoComplete="username" required />
      </label>
      <label className="relative mt-4 block">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
        <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password" required />
      </label>
      {error ? <p className="relative mt-4 text-sm text-rose-300">{error}</p> : null}
      <button type="submit" className="btn-primary relative mt-6 w-full rounded-2xl py-3 text-lg font-bold text-white">
        {submitLabel}
      </button>
      <details className="relative mt-5 text-sm text-slate-400">
        <summary className="cursor-pointer text-slate-300">Demo credentials</summary>
        <p className="mt-2 font-mono text-xs text-slate-300">ID: {hint.id}</p>
        <p className="font-mono text-xs text-slate-300">Password: {hint.password}</p>
      </details>
    </motion.form>
  );
}
