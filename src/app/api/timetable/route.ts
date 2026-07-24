import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { schoolId, grade, dayOfWeek, period, startTime, endTime, subject, staffId, room } = body;

  if (!schoolId || !grade || dayOfWeek === undefined || !period || !subject) {
    return NextResponse.json({ error: "schoolId, grade, dayOfWeek, period, and subject are required" }, { status: 400 });
  }
  if (staff.schoolId !== schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entry = await prisma.timetable.create({
    data: {
      schoolId,
      grade,
      dayOfWeek,
      period,
      startTime: startTime || "08:00",
      endTime: endTime || "08:40",
      subject,
      staffId: staffId || null,
      room: room || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
