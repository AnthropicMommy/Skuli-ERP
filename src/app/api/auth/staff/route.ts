import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { schoolId, staffId, password } = await req.json();

  if (!schoolId || !staffId) {
    return NextResponse.json({ error: "School and Staff ID are required" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || school.status !== "active") {
    return NextResponse.json({ error: "School not found or not active" }, { status: 404 });
  }

  const staff = await prisma.staff.findFirst({
    where: { schoolId, staffId },
    include: { school: { select: { name: true, phone: true, email: true } } },
  });

  if (!staff) {
    return NextResponse.json({ error: "Staff ID not found at this school" }, { status: 404 });
  }

  if (!staff.clerkUserId) {
    return NextResponse.json({
      error: "You haven't set up your account yet. Check your email for an invite link, or contact the principal.",
      schoolContact: { phone: staff.school.phone, email: staff.school.email },
    }, { status: 403 });
  }

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const clerkRes = await fetch("https://api.clerk.com/v1/users/" + staff.clerkUserId + "/verify_password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!clerkRes.ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    clerkUserId: staff.clerkUserId,
    staffId: staff.staffId,
    name: staff.name,
    role: staff.role,
  });
}
