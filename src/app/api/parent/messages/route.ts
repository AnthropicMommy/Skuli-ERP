import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const studentId = "studentId" in session ? session.studentId : null;
  if (!studentId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const classes = await prisma.class.findMany({
    where: { schoolId: student.schoolId, classTeacherId: { not: null } },
    include: { classTeacher: { select: { id: true, name: true } } },
  });

  const messages = await prisma.notification.findMany({
    where: { schoolId: student.schoolId, studentId, type: "parent_message" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ messages, teachers: classes.map((c) => c.classTeacher).filter(Boolean) });
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const studentId = "studentId" in session ? session.studentId : null;
  if (!studentId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const { message, teacherId } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const notification = await prisma.notification.create({
    data: {
      schoolId: student.schoolId,
      studentId,
      title: `Message from ${"parentName" in session ? session.parentName : "Parent"}`,
      message: message.trim(),
      type: "parent_message",
      channel: "in_app",
    },
  });

  return NextResponse.json(notification, { status: 201 });
}
