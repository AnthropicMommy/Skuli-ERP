import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const { classId } = await req.json();
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  if (cls.schoolId !== staff.schoolId) return NextResponse.json({ error: "Class not in your school" }, { status: 403 });
  if (cls.classTeacherId) return NextResponse.json({ error: "Class already has a teacher" }, { status: 409 });

  const alreadyOwns = await prisma.class.findFirst({ where: { classTeacherId: staff.id } });
  if (alreadyOwns) return NextResponse.json({ error: "You already lead another class" }, { status: 409 });

  const updated = await prisma.class.update({
    where: { id: classId },
    data: { classTeacherId: staff.id },
  });

  return NextResponse.json(updated);
}
