"use client";

import { useState } from "react";

function initialsAvatar(name: string, color: string) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="${color}"/><text x="128" y="148" text-anchor="middle" font-size="84" font-family="Arial" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const TEAM = [
  {
    name: "Faiz Khan",
    role: "Project Head",
    sources: ["https://i.ibb.co/kV41zHnn/faiz.jpg"],
    color: "#6d28d9",
    ring: "border-violet-400 shadow-[0_0_24px_rgba(167,139,250,0.65)]",
    roleClass: "text-violet-300",
  },
  {
    name: "Faisal Kamran",
    role: "Developer",
    sources: ["https://ibb.co/DZhmwxr", "https://i.ibb.co/DZhmwxr/image.jpg"],
    color: "#be185d",
    ring: "border-pink-400 shadow-[0_0_24px_rgba(244,114,182,0.65)]",
    roleClass: "text-pink-300",
  },
  {
    name: "Ammar Qazi",
    role: "Developer",
    sources: ["https://ibb.co/DZhmwxr", "https://i.ibb.co/TqtXV6pB/Whats-App-Image-2026-10-12-at-3-04-06-PM.jpg"],
    color: "#1d4ed8",
    ring: "border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.65)]",
    roleClass: "text-sky-300",
  },
  {
    name: "Ukasha",
    role: "Developer",
    sources: ["https://i.ibb.co/KcNdbNLJ/uuuu.jpg"],
    color: "#047857",
    ring: "border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.65)]",
    roleClass: "text-emerald-300",
  },
];

function Portrait({ sources, name, color }: { sources: string[]; name: string; color: string }) {
  const fallback = initialsAvatar(name, color);
  const [index, setIndex] = useState(0);
  const current = sources[index] ?? fallback;
  return (
    // Remote portraits need an onError chain into a local initials image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setIndex((value) => (value >= sources.length ? value : value + 1))}
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
              <Portrait sources={person.sources} name={person.name} color={person.color} />
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
