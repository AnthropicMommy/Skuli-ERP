import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isLeadership } from "@/lib/roles";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const staffList = await prisma.staff.findMany({
    where: { schoolId: staff.schoolId },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(staffList);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentStaff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!currentStaff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  if (!isLeadership(currentStaff.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, phone, role, department, qualification } = body;

  if (!name || !role) {
    return NextResponse.json({ error: "name and role are required" }, { status: 400 });
  }

  const newStaff = await prisma.staff.create({
    data: {
      schoolId: currentStaff.schoolId,
      name,
      email: email || null,
      phone: phone || null,
      role,
      department: department || null,
      qualification: qualification || null,
    },
  });

  return NextResponse.json(newStaff, { status: 201 });
}
