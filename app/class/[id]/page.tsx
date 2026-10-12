import { notFound } from "next/navigation";
import { ClassView } from "@/components/class/ClassView";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classLevel = Number(id);
  if (!Number.isInteger(classLevel) || classLevel < 1 || classLevel > 10) notFound();
  return (
    <>
      <SiteHeader />
      <ClassView classLevel={classLevel} />
    </>
  );
}
