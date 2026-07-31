import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const grade = url.searchParams.get("grade");
  const subject = url.searchParams.get("subject");
  const term = url.searchParams.get("term");
  const assessmentType = url.searchParams.get("assessmentType");

  const where: Record<string, unknown> = {};
  if (grade) where.grade = grade;
  if (subject) where.subject = subject;
  if (term) where.term = term;
  if (assessmentType) where.assessmentType = assessmentType;

  const papers = await prisma.revisionPaper.findMany({
    where,
    orderBy: [{ year: "desc" }, { grade: "asc" }, { subject: "asc" }],
    take: 100,
  });

  // Get unique values for filters
  const grades = await prisma.revisionPaper.findMany({
    select: { grade: true },
    distinct: ["grade"],
    orderBy: { grade: "asc" },
  });

  const subjects = await prisma.revisionPaper.findMany({
    select: { subject: true },
    distinct: ["subject"],
    orderBy: { subject: "asc" },
  });

  return NextResponse.json({
    papers,
    filters: {
      grades: grades.map((g) => g.grade),
      subjects: subjects.map((s) => s.subject),
      terms: ["Term 1", "Term 2", "Term 3"],
      assessmentTypes: ["Opener", "Mid-Term", "End-Term", "KPSEA", "KJSEA", "KCSE", "Exam Revision Booklet"],
    },
  });
}
