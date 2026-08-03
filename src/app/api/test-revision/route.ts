import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(token);
    if (!session || !("studentId" in session)) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const studentId = session.studentId;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const revision = await prisma.testRevision.findFirst({
        where: { id, studentId },
        select: {
          id: true,
          subject: true,
          grade: true,
          title: true,
          totalMarks: true,
          score: true,
          percentage: true,
          questions: true,
          createdAt: true,
        },
      });
      if (!revision) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ revision });
    }

    const revisions = await prisma.testRevision.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        subject: true,
        grade: true,
        title: true,
        totalMarks: true,
        score: true,
        percentage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error("Failed to load test revisions:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
