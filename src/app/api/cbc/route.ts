import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { studentId, subject, strand, term, year, rubricLevel } = body;

  const result = await prisma.cbcResult.upsert({
    where: {
      studentId_subject_strand_term_year: {
        studentId,
        subject,
        strand: strand || "",
        term,
        year,
      },
    },
    update: { rubricLevel },
    create: { studentId, subject, strand: strand || null, term, year, rubricLevel },
  });

  return NextResponse.json(result);
}
