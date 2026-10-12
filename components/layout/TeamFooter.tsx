"use client";

import { useState } from "react";

const TEAM = [
  {
    name: "Faiz Khan",
    role: "Project Head",
    src: "https://i.ibb.co/kV41zHnn/faiz.jpg",
    fallback: "https://ui-avatars.com/api/?name=Faiz+Khan&background=6d28d9&color=fff&size=256",
    ring: "border-violet-400 shadow-[0_0_24px_rgba(167,139,250,0.65)]",
    roleClass: "text-violet-300",
  },
  {
    name: "Faisal Kamran",
    role: "Developer",
    src: "https://ibb.co/DZhmwxr",
    fallback: "https://ui-avatars.com/api/?name=Faisal+Kamran&background=be185d&color=fff&size=256",
    ring: "border-pink-400 shadow-[0_0_24px_rgba(244,114,182,0.65)]",
    roleClass: "text-pink-300",
  },
  {
    name: "Ammar Qazi",
    role: "Developer",
    src: "https://ibb.co/DZhmwxr",
    fallback: "https://ui-avatars.com/api/?name=Ammar+Qazi&background=1d4ed8&color=fff&size=256",
    ring: "border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.65)]",
    roleClass: "text-sky-300",
  },
  {
    name: "Ukasha",
    role: "Developer",
    src: "https://i.ibb.co/KcNdbNLJ/uuuu.jpg",
    fallback: "https://ui-avatars.com/api/?name=Ukasha&background=047857&color=fff&size=256",
    ring: "border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.65)]",
    roleClass: "text-emerald-300",
  },
];

function Portrait({ src, fallback, name }: { src: string; fallback: string; name: string }) {
  const [current, setCurrent] = useState(src);
  return (
    // External portraits are remote and need an onError swap, which next/image does not expose cleanly.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setCurrent(fallback)}
    />
  );
}

export function TeamFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 pt-12 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">A Web Development Project By The Students Of</p>
      <h2 className="mt-3 text-3xl font-extrabold text-gradient md:text-4xl">IQRA Academy of Excellence</h2>
      <div className="mt-10 flex flex-wrap items-start justify-center gap-10">
        {TEAM.map((person) => (
          <figure key={person.name} className="group flex w-36 flex-col items-center">
            <div className={`h-28 w-28 overflow-hidden rounded-full border-4 transition duration-300 group-hover:scale-110 ${person.ring}`}>
              <Portrait src={person.src} fallback={person.fallback} name={person.name} />
            </div>
            <figcaption className="mt-3">
              <div className="font-bold text-white">{person.name}</div>
              <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${person.roleClass}`}>{person.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
        © 2026 IQRA Academy of Excellence
      </p>
    </footer>
  );
}
