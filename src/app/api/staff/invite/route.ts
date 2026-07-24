import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateStaffId } from "@/lib/staff-id";
import { sendStaffInviteEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminStaff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!adminStaff || !["SUPER_ADMIN", "PRINCIPAL", "DEPUTY_ACADEMICS", "DEPUTY_ADMIN"].includes(adminStaff.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, role } = body;

  if (!name || !email || !role) {
    return NextResponse.json({ error: "name, email, and role are required" }, { status: 400 });
  }

  const existing = await prisma.staff.findFirst({
    where: { schoolId: adminStaff.schoolId, email },
  });
  if (existing) {
    return NextResponse.json({ error: "A staff member with this email already exists at this school" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const staffId = await generateStaffId(adminStaff.schoolId, (await prisma.school.findUnique({ where: { id: adminStaff.schoolId } }))!.name);

  const invite = await prisma.inviteToken.create({
    data: {
      schoolId: adminStaff.schoolId,
      email,
      name,
      role,
      token,
      staffId,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  const school = await prisma.school.findUnique({ where: { id: adminStaff.schoolId } });

  try {
    await sendStaffInviteEmail({
      to: email,
      name,
      schoolName: school!.name,
      staffId,
      token,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  return NextResponse.json({
    success: true,
    staffId,
    inviteUrl: `/invite/${token}`,
  }, { status: 201 });
}
