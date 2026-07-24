import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminStaff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!adminStaff || !["SUPER_ADMIN", "PRINCIPAL"].includes(adminStaff.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { staffId } = await req.json();
  if (!staffId) {
    return NextResponse.json({ error: "staffId is required" }, { status: 400 });
  }

  const target = await prisma.staff.findFirst({
    where: { id: staffId, schoolId: adminStaff.schoolId },
  });
  if (!target) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }
  if (target.id === adminStaff.id) {
    return NextResponse.json({ error: "You cannot deactivate yourself" }, { status: 400 });
  }

  await prisma.staff.update({
    where: { id: staffId },
    data: { clerkUserId: null },
  });

  return NextResponse.json({ success: true });
}
