import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  if (!schoolId || schoolId !== staff.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schoolStaff = await prisma.staff.findMany({
    where: { schoolId },
    select: {
      id: true,
      name: true,
      email: true,
      staffId: true,
      role: true,
      clerkUserId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(schoolStaff);
}
