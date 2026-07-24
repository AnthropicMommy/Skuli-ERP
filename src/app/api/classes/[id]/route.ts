import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      classTeacher: { select: { id: true, name: true, role: true, staffId: true } },
      coTeachers: { select: { id: true, name: true, role: true, staffId: true } },
      students: { select: { id: true, name: true, admissionNo: true, grade: true, gender: true } },
      _count: { select: { students: true, enrollments: true } },
    },
  });

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  return NextResponse.json(cls);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls || cls.schoolId !== staff.schoolId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  if (body.action === "approve-claim" && body.teacherId) {
    const updated = await prisma.class.update({
      where: { id },
      data: { classTeacherId: body.teacherId },
    });
    return NextResponse.json(updated);
  }

  if (body.action === "remove-teacher") {
    const updated = await prisma.class.update({
      where: { id },
      data: { classTeacherId: null },
    });
    return NextResponse.json(updated);
  }

  if (body.action === "add-co-teacher" && body.teacherId) {
    const updated = await prisma.class.update({
      where: { id },
      data: { coTeachers: { connect: { id: body.teacherId } } },
    });
    return NextResponse.json(updated);
  }

  if (body.action === "remove-co-teacher" && body.teacherId) {
    const updated = await prisma.class.update({
      where: { id },
      data: { coTeachers: { disconnect: { id: body.teacherId } } },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
