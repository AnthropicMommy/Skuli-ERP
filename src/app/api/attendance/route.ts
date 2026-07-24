import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { studentId, date, status } = body;

  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_date: { studentId, date: dateObj },
    },
    update: { status },
    create: { studentId, date: dateObj, status },
  });

  return NextResponse.json(attendance);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const grade = searchParams.get("grade");

  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const school = await prisma.school.findFirst();
  if (!school) return NextResponse.json([]);

  const attendance = await prisma.attendance.findMany({
    where: {
      date: dateObj,
      student: {
        schoolId: school.id,
        ...(grade ? { grade } : {}),
      },
    },
    include: { student: true },
  });

  return NextResponse.json(attendance);
}
