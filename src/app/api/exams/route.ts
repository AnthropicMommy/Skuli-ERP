import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { schoolId, name, type, term, year, grade, weight } = body;

  if (!schoolId || !name || !grade) {
    return NextResponse.json({ error: "schoolId, name, and grade are required" }, { status: 400 });
  }
  if (staff.schoolId !== schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const exam = await prisma.exam.create({
    data: {
      schoolId,
      name,
      type: type || "CAT",
      term: term || "TERM_1",
      year: year || new Date().getFullYear(),
      grade,
      weight: weight || 100,
    },
  });

  return NextResponse.json(exam, { status: 201 });
}
