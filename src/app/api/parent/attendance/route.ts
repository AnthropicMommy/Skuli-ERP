import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "Missing studentId" }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      attendance: { orderBy: { date: "desc" }, take: 60 },
    },
  });

  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    name: student.name,
    attendance: student.attendance.map((a) => ({
      id: a.id,
      date: a.date.toISOString(),
      status: a.status,
    })),
  });
}
