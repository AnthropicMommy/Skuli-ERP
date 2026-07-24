import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff || !["SUPER_ADMIN", "PRINCIPAL"].includes(staff.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const school = await prisma.school.findUnique({ where: { id: staff.schoolId } });
  return NextResponse.json({ joinCode: school?.joinCode || null });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff || !["SUPER_ADMIN", "PRINCIPAL"].includes(staff.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { joinCode } = await req.json();
  if (!joinCode || typeof joinCode !== "string" || joinCode.length < 4) {
    return NextResponse.json({ error: "Join code must be at least 4 characters" }, { status: 400 });
  }

  await prisma.school.update({
    where: { id: staff.schoolId },
    data: { joinCode: joinCode.toUpperCase() },
  });

  return NextResponse.json({ joinCode: joinCode.toUpperCase() });
}
