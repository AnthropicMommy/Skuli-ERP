import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session || !("studentId" in session)) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { classId } = await req.json();
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const existing = await prisma.studentEnrollment.findUnique({
    where: { studentId_classId: { studentId: session.studentId, classId } },
  });

  if (existing) {
    if (existing.status === "APPROVED") return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    if (existing.status === "PENDING") return NextResponse.json({ error: "Request already pending" }, { status: 409 });
  }

  const enrollment = await prisma.studentEnrollment.upsert({
    where: { studentId_classId: { studentId: session.studentId, classId } },
    update: { status: "PENDING" },
    create: { studentId: session.studentId, classId, status: "PENDING" },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
