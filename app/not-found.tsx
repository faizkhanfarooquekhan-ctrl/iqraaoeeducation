import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">IQRA AOE</p>
        <h1 className="mt-3 text-5xl font-black text-gradient">This page is not on the syllabus</h1>
        <Link href="/" className="btn-primary mt-6 inline-block rounded-2xl px-5 py-3 font-bold text-white">
          Back to the academy
        </Link>
      </div>
    </main>
  );
}
