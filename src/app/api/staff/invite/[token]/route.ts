import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }
  if (invite.used) {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 410 });
  }
  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  const school = await prisma.school.findUnique({ where: { id: invite.schoolId } });

  return NextResponse.json({
    schoolName: school?.name,
    staffName: invite.name,
    email: invite.email,
    role: invite.role,
    staffId: invite.staffId,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }
  if (invite.used) {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 410 });
  }
  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  const body = await req.json();
  const { clerkUserId } = body;

  if (!clerkUserId) {
    return NextResponse.json({ error: "clerkUserId is required" }, { status: 400 });
  }

  const staff = await prisma.staff.create({
    data: {
      clerkUserId,
      staffId: invite.staffId,
      schoolId: invite.schoolId,
      name: invite.name,
      email: invite.email,
      role: invite.role,
      dateJoined: new Date(),
    },
  });

  await prisma.inviteToken.update({
    where: { id: invite.id },
    data: { used: true },
  });

  return NextResponse.json({ success: true, staffId: staff.staffId }, { status: 201 });
}
