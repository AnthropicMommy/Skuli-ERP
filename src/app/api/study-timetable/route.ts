import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session || !("studentId" in session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const timetable = await prisma.studyTimetable.findMany({
    where: { studentId: session.studentId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ timetable });
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session || !("studentId" in session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { entries } = await req.json();

  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "At least one entry is required" }, { status: 400 });
  }

  // Delete existing and replace
  await prisma.studyTimetable.deleteMany({
    where: { studentId: session.studentId },
  });

  const created = await prisma.studyTimetable.createMany({
    data: entries.map((e: { dayOfWeek: number; startTime: string; endTime: string; subject: string }) => ({
      studentId: session.studentId,
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      endTime: e.endTime,
      subject: e.subject,
    })),
  });

  return NextResponse.json({ count: created.count }, { status: 201 });
}

export async function DELETE(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session || !("studentId" in session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  await prisma.studyTimetable.deleteMany({
    where: { id, studentId: session.studentId },
  });

  return NextResponse.json({ ok: true });
}
