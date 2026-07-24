import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signStudentToken } from "@/lib/auth";
import { sendParentWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { schoolId, name, admissionNo, grade, password, parentEmail, sameAsParent } = await req.json();

  if (!schoolId || !name || !admissionNo || !grade || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || school.status !== "active") {
    return NextResponse.json({ error: "School not found or not active" }, { status: 404 });
  }

  const existing = await prisma.student.findUnique({
    where: { schoolId_admissionNo: { schoolId, admissionNo } },
  });
  if (existing) {
    return NextResponse.json({ error: "Student with this admission number already exists" }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);

  const student = await prisma.student.create({
    data: {
      schoolId,
      name,
      admissionNo,
      grade: String(grade),
      parentEmail: sameAsParent ? null : parentEmail,
      parentPassword: hashedPassword,
    },
  });

  if (parentEmail && !sameAsParent) {
    try {
      await sendParentWelcomeEmail({ to: parentEmail, parentName: "Parent", studentName: name, schoolName: school.name });
    } catch {
      // email send failure is non-blocking
    }
  }

  const token = signStudentToken({
    studentId: student.id,
    schoolId: student.schoolId,
    admissionNo: student.admissionNo,
    name: student.name,
    grade: student.grade,
  });

  return NextResponse.json({ token, student: { id: student.id, name: student.name, grade: student.grade } }, { status: 201 });
}
