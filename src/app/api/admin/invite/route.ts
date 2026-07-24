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

  const body = await req.json();
  const { schoolId, name, email, role } = body;

  if (!schoolId || !email || !role) {
    return NextResponse.json({ error: "schoolId, email, and role are required" }, { status: 400 });
  }

  // Generate a temp password for the user
  const tempPassword = `Skuli${Math.random().toString(36).slice(-8)}!`;

  try {
    // Create user in Clerk via the backend API
    const clerkRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password: tempPassword,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || undefined,
        skip_password_checks: true,
      }),
    });

    if (!clerkRes.ok) {
      const err = await clerkRes.json();
      return NextResponse.json({ error: err.errors?.[0]?.message || "Failed to create Clerk user" }, { status: 400 });
    }

    const clerkUser = await clerkRes.json();

    // Update staff record with Clerk user ID
    await prisma.staff.updateMany({
      where: { schoolId, role },
      data: { clerkUserId: clerkUser.id },
    });

    return NextResponse.json({
      success: true,
      clerkUserId: clerkUser.id,
      tempPassword,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
  }
}
