import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signStudentToken, comparePassword } from "@/lib/auth";

const INDEPENDENT_SCHOOL_ID = "skuli-open-learning";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { schoolId: INDEPENDENT_SCHOOL_ID, parentEmail: email },
    });

    if (!student) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    if (!student.parentPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, student.parentPassword);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = signStudentToken({
      studentId: student.id,
      schoolId: student.schoolId,
      admissionNo: student.admissionNo,
      name: student.name,
      grade: student.grade,
      isIndependent: true,
    });

    return NextResponse.json({ token, studentId: student.id, name: student.name });
  } catch (error) {
    console.error("Independent login error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
