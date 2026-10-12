"use client";

import { useEffect, useState } from "react";

type Speck = { id: number; left: number; delay: number; duration: number; size: number; color: string };

const COLORS = ["#c4b5fd", "#f9a8d4", "#6ee7b7", "#67e8f9", "#fde68a"];

export function Particles() {
  const [specks, setSpecks] = useState<Speck[]>([]);

  useEffect(() => {
    setSpecks(
      Array.from({ length: 32 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 16,
        size: 2 + Math.random() * 4,
        color: COLORS[id % COLORS.length],
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {specks.map((speck) => (
        <span
          key={speck.id}
          className="absolute bottom-[-10px] rounded-full opacity-70"
          style={{
            left: `${speck.left}%`,
            width: speck.size,
            height: speck.size,
            background: speck.color,
            boxShadow: `0 0 12px ${speck.color}`,
            animation: `float-particle ${speck.duration}s linear ${speck.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
