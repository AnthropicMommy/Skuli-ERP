import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { admissionNo, name, grade, stream, gender, parentName, parentPhone, schoolId } = body;

  const school = await prisma.school.findFirst();
  if (!school) return NextResponse.json({ error: "No school" }, { status: 404 });

  const student = await prisma.student.create({
    data: {
      schoolId: schoolId || school.id,
      admissionNo,
      name,
      grade,
      stream: stream || null,
      gender: gender || null,
      parentName: parentName || null,
      parentPhone: parentPhone || null,
    },
  });

  return NextResponse.json(student);
}

export async function GET() {
  const school = await prisma.school.findFirst();
  if (!school) return NextResponse.json([]);

  const students = await prisma.student.findMany({
    where: { schoolId: school.id },
    orderBy: [{ grade: "asc" }, { admissionNo: "asc" }],
  });

  return NextResponse.json(students);
}
