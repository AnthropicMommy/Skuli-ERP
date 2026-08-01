import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signStudentToken } from "@/lib/auth";

const INDEPENDENT_SCHOOL_ID = "skuli-open-learning";

export async function POST(req: Request) {
  try {
    const { name, email, grade, password } = await req.json();

    if (!name || !email || !grade || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Ensure the independent learning school exists
    await prisma.school.upsert({
      where: { id: INDEPENDENT_SCHOOL_ID },
      update: {},
      create: {
        id: INDEPENDENT_SCHOOL_ID,
        clerkOrgId: INDEPENDENT_SCHOOL_ID,
        name: "Skuli Open Learning",
        email: "open@skuli.co.ke",
        phone: "+254700000000",
        address: "Nairobi, Kenya",
        status: "active",
        plan: "TRIAL",
      },
    });

    // Check for existing email
    const existing = await prisma.student.findFirst({
      where: { schoolId: INDEPENDENT_SCHOOL_ID, parentEmail: email },
    });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    // Generate a unique admission number for independent students
    const timestamp = Date.now().toString(36).toUpperCase();
    const admissionNo = `IND/${timestamp}`;

    const student = await prisma.student.create({
      data: {
        schoolId: INDEPENDENT_SCHOOL_ID,
        name,
        admissionNo,
        grade: String(grade),
        parentEmail: email,
        parentPassword: hashedPassword,
      },
    });

    const token = signStudentToken({
      studentId: student.id,
      schoolId: student.schoolId,
      admissionNo: student.admissionNo,
      name: student.name,
      grade: student.grade,
      isIndependent: true,
    });

    return NextResponse.json({ token, student: { id: student.id, name: student.name, grade: student.grade } }, { status: 201 });
  } catch (error) {
    console.error("Independent signup error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
