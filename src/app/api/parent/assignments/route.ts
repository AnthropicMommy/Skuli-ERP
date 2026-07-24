import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const assignments = await prisma.assignment.findMany({
    where: { grade: student.grade },
    include: {
      submissions: { where: { studentId } },
    },
    orderBy: { dueDate: "desc" },
    take: 20,
  });

  return NextResponse.json({
    name: student.name,
    assignments: assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      subject: a.subject,
      dueDate: a.dueDate?.toISOString() || new Date().toISOString(),
      submittedAt: a.submissions[0]?.submittedAt?.toISOString() || null,
    })),
  });
}
