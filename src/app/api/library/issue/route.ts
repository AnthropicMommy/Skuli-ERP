import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { bookId, studentId } = body;

  if (!bookId || !studentId) {
    return NextResponse.json({ error: "bookId and studentId are required" }, { status: 400 });
  }

  const book = await prisma.libraryBook.findUnique({ where: { id: bookId } });
  if (!book || book.schoolId !== staff.schoolId) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.available <= 0) {
    return NextResponse.json({ error: "No copies available" }, { status: 400 });
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const transaction = await prisma.libraryTransaction.create({
    data: {
      bookId,
      studentId,
      dueDate,
    },
  });

  await prisma.libraryBook.update({
    where: { id: bookId },
    data: { available: book.available - 1 },
  });

  return NextResponse.json(transaction, { status: 201 });
}
