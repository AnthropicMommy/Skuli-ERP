import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReportCard } from "@/components/report-card";

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

const COMPETENCY_LABELS: Record<string, string> = {
  COMMUNICATION: "Communication & Collaboration",
  CRITICAL_THINKING: "Critical Thinking & Problem Solving",
  CREATIVITY: "Creativity & Imagination",
  CITIZENSHIP: "Citizenship",
  DIGITAL_LITERACY: "Digital Literacy",
  LEARNING_TO_LEARN: "Learning to Learn",
  SELF_EFFICACY: "Self-Efficacy",
};

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

  const latestYear = student.cbcResults.length > 0 ? student.cbcResults[0].year : new Date().getFullYear();
  const latestTerm = student.cbcResults.length > 0 ? student.cbcResults[0].term : "TERM_1";

  const termResults = student.cbcResults.filter(
    (r) => r.year === latestYear && r.term === latestTerm
  );
  const termCompetencies = student.competencies.filter(
    (c) => c.year === latestYear && c.term === latestTerm
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ReportCard
        schoolName={student.school.name}
        studentName={student.name}
        admissionNumber={student.admissionNo}
        grade={student.grade + (student.stream ? ` - ${student.stream}` : "")}
        term={TERM_LABELS[latestTerm] || latestTerm}
        year={String(latestYear)}
        subjects={termResults.map((r) => ({
          subject: r.subject,
          rubric: r.rubricLevel as "EE1" | "EE2" | "ME1" | "ME2" | "AE1" | "AE2" | "BE1" | "BE2",
        }))}
        competencies={termCompetencies.map((c) => ({
          competency: COMPETENCY_LABELS[c.competency] || c.competency,
          rubric: (c.score || "ME2") as "EE1" | "EE2" | "ME1" | "ME2" | "AE1" | "AE2" | "BE1" | "BE2",
        }))}
        interactive={false}
      />
    </div>
  );
}
