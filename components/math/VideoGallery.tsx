"use client";

import Link from "next/link";
import { VIDEOS } from "@/lib/data/math";

export function VideoGallery({ classLevel, compact = false }: { classLevel: number; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mx-auto max-w-5xl px-4 py-8"}>
      {compact ? null : (
        <>
          <Link href={`/class/${classLevel}`} className="text-sm text-slate-400 hover:text-white">← Class {classLevel}</Link>
          <h1 className="mt-3 text-4xl font-black text-gradient">Video lessons</h1>
          <p className="mt-2 text-slate-300">Fractions and decimals, the two visuals the upper-primary syllabus leans on.</p>
        </>
      )}
      <div className={`grid gap-6 md:grid-cols-2 ${compact ? "mt-6" : "mt-8"}`}>
        {VIDEOS.map((video) => (
          <article key={video.id} className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            <iframe
              className="aspect-video w-full"
              src={video.embed}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="p-4">
              <h2 className="font-bold">{video.title}</h2>
              <p className="text-sm text-slate-400">{video.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
