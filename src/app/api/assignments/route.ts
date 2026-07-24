import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { schoolId, title, description, grade, subject, term, year, dueDate } = body;

  if (!schoolId || !title || !grade || !subject) {
    return NextResponse.json({ error: "schoolId, title, grade, and subject are required" }, { status: 400 });
  }
  if (staff.schoolId !== schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      schoolId,
      title,
      description: description || null,
      grade,
      subject,
      term: term || "TERM_1",
      year: year || new Date().getFullYear(),
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: staff.id,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
