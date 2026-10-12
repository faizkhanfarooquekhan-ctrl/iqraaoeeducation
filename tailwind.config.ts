import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        nastaliq: ["var(--font-nastaliq)", "serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(168, 85, 247, 0.35)",
        "glow-pink": "0 0 40px rgba(236, 72, 153, 0.35)",
        "glow-emerald": "0 0 40px rgba(16, 185, 129, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
