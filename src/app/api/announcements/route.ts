import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, content, priority, classId, targetRole } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      schoolId: staff.schoolId,
      classId: classId || null,
      title,
      content,
      priority: priority || "normal",
      targetRole: targetRole || null,
      authorId: staff.id,
      authorName: staff.name,
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Try staff auth first
  const { userId } = await auth();
  let schoolId: string | null = null;

  if (userId) {
    const staff = await prisma.staff.findFirst({
      where: { clerkUserId: userId },
      select: { schoolId: true },
    });
    schoolId = staff?.schoolId ?? null;
  }

  // If no staff auth, try student/parent JWT
  if (!schoolId) {
    const token = getTokenFromRequest(req);
    if (token) {
      const session = verifyToken(token);
      if (session && "schoolId" in session) {
        schoolId = session.schoolId;
      }
    }
  }

  if (!schoolId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = url.searchParams.get("classId");

  const where: Record<string, unknown> = { schoolId };
  // Filter: show school-wide announcements + announcements for this specific class
  if (classId) {
    where.OR = [
      { classId: null },
      { classId },
    ];
  }

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(announcements);
}
