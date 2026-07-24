import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const { status } = await req.json();
  if (!["APPROVED", "REJECTED"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id },
    include: { class: true, student: true },
  });

  if (!enrollment || enrollment.class.schoolId !== staff.schoolId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.studentEnrollment.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED") {
    await prisma.student.update({
      where: { id: enrollment.studentId },
      data: { classId: enrollment.classId },
    });
  }

  return NextResponse.json(updated);
}
