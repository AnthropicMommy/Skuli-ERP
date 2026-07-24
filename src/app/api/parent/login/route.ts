import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { phone } = await req.json();

  const student = await prisma.student.findFirst({
    where: { parentPhone: phone },
  });

  if (!student) {
    return NextResponse.json({ error: "No student found" }, { status: 404 });
  }

  return NextResponse.json({
    studentId: student.id,
    parentName: student.parentName || "Parent",
    studentName: student.name,
  });
}
