import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { schoolId, title, author, category, copies, isbn } = body;

  if (!schoolId || !title) {
    return NextResponse.json({ error: "schoolId and title are required" }, { status: 400 });
  }
  if (staff.schoolId !== schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const book = await prisma.libraryBook.create({
    data: {
      schoolId,
      title,
      author: author || null,
      category: category || null,
      copies: copies || 1,
      available: copies || 1,
      isbn: isbn || null,
    },
  });

  return NextResponse.json(book, { status: 201 });
}
