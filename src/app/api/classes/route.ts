import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const classes = await prisma.class.findMany({
    where: { schoolId: staff.schoolId },
    include: {
      classTeacher: { select: { id: true, name: true, role: true } },
      _count: { select: { students: true, coTeachers: true } },
    },
    orderBy: { grade: "asc" },
  });

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const level = ["SUPER_ADMIN", "DIRECTOR", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN"].includes(staff.role);
  if (!level) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { name, grade } = await req.json();
  if (!name || !grade) return NextResponse.json({ error: "Name and grade required" }, { status: 400 });

  const existing = await prisma.class.findUnique({
    where: { schoolId_grade: { schoolId: staff.schoolId, grade: Number(grade) } },
  });
  if (existing) return NextResponse.json({ error: "Class for this grade already exists" }, { status: 409 });

  const cls = await prisma.class.create({
    data: { name, grade: Number(grade), schoolId: staff.schoolId },
  });

  return NextResponse.json(cls, { status: 201 });
}
