import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const subject = url.searchParams.get("subject");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  // Verify requester is staff (teacher/parent)
  const { userId } = await auth();
  let isAuthorized = false;

  if (userId) {
    const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
    if (staff) isAuthorized = true;
  }

  // Also allow parent JWT auth
  if (!isAuthorized) {
    const { verifyToken, getTokenFromRequest } = await import("@/lib/auth");
    const token = getTokenFromRequest(req);
    if (token) {
      const session = verifyToken(token);
      if (session && "studentId" in session && session.studentId === studentId) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where: Record<string, unknown> = { studentId };
  if (subject) where.subject = subject;

  const messages = await prisma.mwalimuMessage.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json(messages);
}
