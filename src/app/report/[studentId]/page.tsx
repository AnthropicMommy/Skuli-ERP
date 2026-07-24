import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReportCard } from "@/components/report-card";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      cbcResults: { orderBy: [{ year: "desc" }, { term: "desc" }] },
      competencies: { orderBy: [{ year: "desc" }, { term: "desc" }] },
    },
  });

  if (!student) notFound();

  return (
    <ReportCard
      student={student}
      school={student.school}
      results={student.cbcResults}
      competencies={student.competencies}
    />
  );
}
