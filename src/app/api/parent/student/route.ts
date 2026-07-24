import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      cbcResults: { orderBy: [{ year: "desc" }, { term: "desc" }] },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    name: student.name,
    admissionNo: student.admissionNo,
    grade: student.grade,
    stream: student.stream,
    results: student.cbcResults,
  });
}
