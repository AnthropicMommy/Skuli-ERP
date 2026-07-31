import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALL_GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const ALL_SUBJECTS = [
  "English", "Kiswahili", "Mathematics", "Science & Technology", "Integrated Science",
  "Social Studies", "Religious Education", "Creative Arts", "Physical & Health Education",
  "Agriculture & Nutrition", "Computer Studies", "Home Science", "Pre-Technical Education",
  "Foreign Languages", "German", "French", "Mandarin",
  "Physics", "Chemistry", "Biology", "Geography", "History & Government",
  "Business Studies", "Agriculture",
];

const ALL_TERMS = ["Term 1", "Term 2", "Term 3"];

const ALL_ASSESSMENT_TYPES = [
  "Opener", "Mid-Term", "End-Term",
  "KPSEA", "KJSEA", "KCSE",
  "Exam Revision Booklet",
];

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
    select: {
      id: true,
      title: true,
      grade: true,
      subject: true,
      term: true,
      assessmentType: true,
      year: true,
      downloadCount: true,
      createdAt: true,
    },
  });

  // Merge hardcoded options with any DB-specific values
  const dbGrades = await prisma.revisionPaper.findMany({
    select: { grade: true },
    distinct: ["grade"],
    orderBy: { grade: "asc" },
  });
  const dbSubjects = await prisma.revisionPaper.findMany({
    select: { subject: true },
    distinct: ["subject"],
    orderBy: { subject: "asc" },
  });

  const grades = [...new Set([...ALL_GRADES, ...dbGrades.map((g) => g.grade)])].sort((a, b) => Number(a) - Number(b));
  const subjects = [...new Set([...ALL_SUBJECTS, ...dbSubjects.map((s) => s.subject)])].sort();

  return NextResponse.json({
    papers,
    filters: {
      grades,
      subjects,
      terms: ALL_TERMS,
      assessmentTypes: ALL_ASSESSMENT_TYPES,
    },
  });
}
