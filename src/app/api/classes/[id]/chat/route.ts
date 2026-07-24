import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const url = new URL(req.url);
  const before = url.searchParams.get("before");

  const where: Record<string, unknown> = { classId: id };
  if (before) {
    where.createdAt = { lt: new Date(before) };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(messages.reverse());
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = verifyToken(token);
  if (!session) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const userId = "studentId" in session ? session.studentId : "parentId" in session ? (session as { parentId: string }).parentId : "";
  const userName = "name" in session ? session.name : "parentName" in session ? (session as { parentName: string }).parentName : "User";

  const now = new Date();
  const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  const cooldown = await prisma.chatCooldown.findUnique({
    where: { classId_userId: { classId: id, userId } },
  });

  if (cooldown) {
    const timeSinceLast = now.getTime() - cooldown.lastSent.getTime();
    if (timeSinceLast < 60000) {
      const waitSeconds = Math.ceil((60000 - timeSinceLast) / 1000);
      return NextResponse.json({ error: `Please wait ${waitSeconds} seconds before sending another message` }, { status: 429 });
    }

    if (cooldown.windowStart < fiveHoursAgo) {
      await prisma.chatCooldown.update({
        where: { id: cooldown.id },
        data: { messageCount: 1, windowStart: now, lastSent: now },
      });
    } else if (cooldown.messageCount >= 15) {
      await prisma.chatMessage.create({
        data: { classId: id, senderId: "system", senderName: "Mwalimu", senderType: "system", content: "📚 Time to focus on your studies! Consider picking up a book from your reading list." },
      });
      await prisma.chatCooldown.update({
        where: { id: cooldown.id },
        data: { messageCount: cooldown.messageCount + 1, lastSent: now },
      });
      return NextResponse.json({ studyReminder: true, message: "Time to focus on your studies!" });
    } else {
      await prisma.chatCooldown.update({
        where: { id: cooldown.id },
        data: { messageCount: cooldown.messageCount + 1, lastSent: now },
      });
    }
  } else {
    await prisma.chatCooldown.create({
      data: { classId: id, userId, lastSent: now, messageCount: 1, windowStart: now },
    });
  }

  const message = await prisma.chatMessage.create({
    data: { classId: id, senderId: userId, senderName: userName, senderType: "student", content: content.trim() },
  });

  return NextResponse.json(message, { status: 201 });
}
