import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = verifyToken(token);
    if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const studentId = "studentId" in session ? session.studentId : null;
    if (!studentId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const url = new URL(req.url);
    const debug = url.searchParams.get("debug");

    if (debug === "1") {
      // Diagnostic mode: check DB state
      const totalMessages = await prisma.mwalimuMessage.count();
      const myMessages = await prisma.mwalimuMessage.count({ where: { studentId } });
      const anyMessages = await prisma.mwalimuMessage.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, studentId: true, role: true, content: true, subject: true, createdAt: true } });
      return NextResponse.json({
        studentId,
        totalMessages,
        myMessages,
        recentMessages: anyMessages,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
      });
    }

    const subject = url.searchParams.get("subject") || undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

    const messages = await prisma.mwalimuMessage.findMany({
      where: {
        studentId,
        ...(subject ? { subject } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        role: true,
        content: true,
        subject: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load history:", error);
    return NextResponse.json({ error: "Failed to load history", detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
