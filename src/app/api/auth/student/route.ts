import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signStudentToken, comparePassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { schoolId, admissionNo, password } = await req.json();

  if (!schoolId || !admissionNo) {
    return NextResponse.json({ error: "School and Student ID are required" }, { status: 400 });
  }

  // Check school is active
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || school.status !== "active") {
    return NextResponse.json({ error: "School not found or not active" }, { status: 404 });
  }

  const student = await prisma.student.findFirst({
    where: { schoolId, admissionNo },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // For MVP: if no password set, allow login with admission number as password
  // In production, passwords would be required
  if (student.parentPassword) {
    const valid = await comparePassword(password, student.parentPassword);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } else if (password !== admissionNo) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signStudentToken({
    studentId: student.id,
    schoolId: student.schoolId,
    admissionNo: student.admissionNo,
    name: student.name,
    grade: student.grade,
  });

  return NextResponse.json({ token, studentId: student.id, name: student.name });
}
