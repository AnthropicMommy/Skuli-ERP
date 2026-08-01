import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(token);
    if (!session || !("studentId" in session)) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { subject, grade, title, totalMarks, score, percentage, questions } = await req.json();

    if (!questions || !subject) {
      return NextResponse.json({ error: "Missing required fields", hasQuestions: !!questions, hasSubject: !!subject }, { status: 400 });
    }

    const revision = await prisma.testRevision.create({
      data: {
        studentId: session.studentId,
        subject,
        grade: grade || String("grade" in session ? session.grade : 4),
        title: title || `${subject} Test`,
        totalMarks: totalMarks || 0,
        score: score || 0,
        percentage: percentage || 0,
        questions: questions,
      },
    });

    return NextResponse.json({ revisionId: revision.id });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Save revision error:", detail);
    return NextResponse.json({ error: "Failed to save revision", detail }, { status: 500 });
  }
}
