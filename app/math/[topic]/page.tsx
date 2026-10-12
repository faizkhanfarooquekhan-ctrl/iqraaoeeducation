import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MathTopicView } from "@/components/math/MathTopicView";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StudentShell } from "@/components/layout/StudentShell";
import { isMathTopic, type MathTopic } from "@/lib/data/math";

export default async function MathPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const allowed = isMathTopic(topic) || topic === "practice" || topic === "test";
  if (!allowed) notFound();
  const body = (
    <Suspense fallback={<p className="px-4 py-16 text-center text-slate-400">Loading the math module…</p>}>
      <MathTopicView topic={topic as MathTopic | "practice" | "test"} />
    </Suspense>
  );
  if (topic === "practice" || topic === "test") {
    return <StudentShell>{body}</StudentShell>;
  }
  return (
    <>
      <SiteHeader />
      {body}
    </>
  );
}
