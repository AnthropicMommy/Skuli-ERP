import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifyToken(token);
  if (!session || !("studentId" in session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { grade, subjects, challenge, goal } = await req.json();

  if (!grade || !subjects || !challenge || !goal) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Upsert profile
  const profile = await prisma.studentProfile.upsert({
    where: { studentId: session.studentId },
    update: {
      grade,
      subjects: JSON.stringify(subjects),
      challenge,
      goal,
    },
    create: {
      studentId: session.studentId,
      grade,
      subjects: JSON.stringify(subjects),
      challenge,
      goal,
    },
  });

  return NextResponse.json({ profile }, { status: 200 });
}

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifyToken(token);
  if (!session || !("studentId" in session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { studentId: session.studentId },
  });

  return NextResponse.json({ profile });
}
