import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signParentToken, comparePassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { schoolId, studentId, password } = await req.json();

  if (!schoolId || !studentId) {
    return NextResponse.json({ error: "School and Student ID are required" }, { status: 400 });
  }

  // Check school is active
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || school.status !== "active") {
    return NextResponse.json({ error: "School not found or not active" }, { status: 404 });
  }

  const student = await prisma.student.findFirst({
    where: { schoolId, admissionNo: studentId },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // For MVP: if no password set, allow login with student ID as password
  if (student.parentPassword) {
    const valid = await comparePassword(password, student.parentPassword);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } else if (password !== studentId) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signParentToken({
    studentId: student.id,
    schoolId: student.schoolId,
    parentName: student.parentName || "Parent",
    studentName: student.name,
  });

  return NextResponse.json({
    token,
    studentId: student.id,
    parentName: student.parentName,
    studentName: student.name,
  });
}
