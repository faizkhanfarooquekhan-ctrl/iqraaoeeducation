"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Sigma, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TeamFooter } from "@/components/layout/TeamFooter";
import { CLASS_PLANS } from "@/lib/data/curriculum";

const pillars = [
  {
    icon: BookOpen,
    title: "Three languages",
    copy: "English, Hindi, and Urdu rhyme families in 2, 3, and 4 letter sets, each with speech.",
  },
  {
    icon: Sigma,
    title: "Balbharati mathematics",
    copy: "Class 1 through SSC Class 10: operations, fractions, decimals, LCM, algebra, and geometry.",
  },
  {
    icon: Sparkles,
    title: "XP, streaks, report cards",
    copy: "Practice gives instant feedback. Tests stay quiet until the confetti and the score.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.35em] text-pink-200">
              Mumbai · Maharashtra · Classes 1–10
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 text-5xl font-black leading-[0.95] md:text-7xl"
            >
              IQRA <span className="text-gradient">AOE</span>
            </motion.h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Academy of Excellence. A dark, glass-lit classroom for phonics, Urdu pronunciation, and the Maharashtra mathematics syllabus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary rounded-2xl px-6 py-3 font-bold text-white">Enter as student</Link>
              <Link href="/class/1" className="btn-ghost rounded-2xl px-6 py-3 font-bold">Browse Class 1</Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass relative overflow-hidden rounded-[2rem] p-6"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Tonight&apos;s board</p>
            <ul className="mt-4 space-y-3 text-lg">
              <li>अब · कब · जब</li>
              <li>اگر · مگر · نگر</li>
              <li>2 का पहाड़ा through Class 10 roots</li>
            </ul>
          </motion.div>
        </section>

        <section id="about" className="mt-20">
          <h2 className="text-3xl font-black">About the academy</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            IQRA AOE is a student-built classroom for the learners of IQRA Academy of Excellence. The language studios drill rhythmic word families. The math arena follows Balbharati from the first counting lessons to SSC quadratics, circles, and the sine of 30 degrees.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="glass-card rounded-3xl p-6">
                <pillar.icon className="h-6 w-6 text-violet-200" />
                <h3 className="mt-4 text-xl font-bold">{pillar.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-black">Classes 1 to 10</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CLASS_PLANS.map((plan) => (
              <Link key={plan.classLevel} href={`/class/${plan.classLevel}`} className="glass-card rounded-3xl p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">{plan.stage}</p>
                <h3 className="mt-1 text-2xl font-black">Class {plan.classLevel}</h3>
                <p className="mt-1 text-sm text-slate-300">{plan.title}</p>
              </Link>
            ))}
          </div>
        </section>
        <TeamFooter />
      </main>
    </>
  );
}
