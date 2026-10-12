import { notFound } from "next/navigation";
import { WordStudio } from "@/components/language/WordStudio";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isSubject } from "@/lib/data/words";

export default async function LanguagePage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  if (!isSubject(subject)) notFound();
  return (
    <>
      <SiteHeader />
      <WordStudio subject={subject} />
    </>
  );
}
