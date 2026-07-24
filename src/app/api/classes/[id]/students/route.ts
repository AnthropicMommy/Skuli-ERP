import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.student.findMany({
    where: { classId: id },
    select: { id: true, name: true, admissionNo: true, grade: true, gender: true, parentEmail: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls || cls.schoolId !== staff.schoolId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== staff.schoolId) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  await prisma.student.update({ where: { id: studentId }, data: { classId: id } });

  const enrollment = await prisma.studentEnrollment.upsert({
    where: { studentId_classId: { studentId, classId: id } },
    update: { status: "APPROVED" },
    create: { studentId, classId: id, status: "APPROVED" },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
