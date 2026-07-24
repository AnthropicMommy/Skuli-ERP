import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["makau1.peter@gmail.com", "petervfk1@gmail.com"];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user already has a staff record
  const existing = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (existing) {
    return NextResponse.json({ error: "You already have a staff record", staffId: existing.id }, { status: 400 });
  }

  const body = await req.json();
  const { schoolName, county, subCounty, schoolType, phone, email, motto } = body;

  if (!schoolName) {
    return NextResponse.json({ error: "schoolName is required" }, { status: 400 });
  }

  // Get user's email from Clerk to check admin status
  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  const clerkUser = await clerkRes.json();
  const userEmail = clerkUser.email_addresses?.[0]?.email_address || "";
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  // Create school + staff record
  const school = await prisma.school.create({
    data: {
      clerkOrgId: `org_${userId}`,
      name: schoolName,
      county: county || null,
      subCounty: subCounty || null,
      schoolType: schoolType || "primary",
      phone: phone || null,
      email: email || null,
      motto: motto || null,
      staff: {
        create: {
          clerkUserId: userId,
          name: `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || userEmail,
          email: userEmail,
          phone: phone || null,
          role: isAdmin ? "SUPER_ADMIN" : "PRINCIPAL",
        },
      },
    },
    include: { staff: true },
  });

  return NextResponse.json({
    schoolId: school.id,
    staffId: school.staff[0].id,
    role: isAdmin ? "SUPER_ADMIN" : "PRINCIPAL",
  }, { status: 201 });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({
    where: { clerkUserId: userId },
    include: { school: true },
  });

  return NextResponse.json({
    hasStaffRecord: !!staff,
    role: staff?.role || null,
    school: staff?.school || null,
  });
}
