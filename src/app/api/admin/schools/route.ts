import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["makau1.peter@gmail.com", "petervfk1@gmail.com"];

async function ensureStaffRecord(userId: string) {
  const existing = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (existing) return { staff: existing, debug: "found_existing" };

  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  const clerkUser = await clerkRes.json();
  const email = clerkUser.email_addresses?.[0]?.email_address || "";
  const isAdmin = ADMIN_EMAILS.includes(email);

  if (!isAdmin) return { staff: null, debug: `not_admin: ${email}` };

  const name = `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || email;

  let school = await prisma.school.findFirst({
    where: { staff: { some: { clerkUserId: userId } } },
  });
  if (!school) {
    school = await prisma.school.create({
      data: {
        clerkOrgId: `admin_${userId}`,
        name: `${name}'s School`,
        status: "active",
        staff: {
          create: {
            clerkUserId: userId,
            name,
            email,
            role: "SUPER_ADMIN",
          },
        },
      },
    });
    const created = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
    return { staff: created, debug: "created_new" };
  }

  const created = await prisma.staff.create({
    data: { clerkUserId: userId, name, email, role: "SUPER_ADMIN", schoolId: school.id },
  });
  return { staff: created, debug: "created_attached" };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { staff: staffRecord, debug: getDebug } = await ensureStaffRecord(userId);
  if (!staffRecord || !["SUPER_ADMIN", "PRINCIPAL"].includes(staffRecord.role)) {
    return NextResponse.json({ error: "Forbidden", debug: getDebug, role: staffRecord?.role, userId }, { status: 403 });
  }

  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { students: true, staff: true } },
    },
  });

  return NextResponse.json(schools);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { staff: adminStaff, debug } = await ensureStaffRecord(userId);
  if (!adminStaff || adminStaff.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden", debug, role: adminStaff?.role, userId }, { status: 403 });
  }

  const body = await req.json();
  const {
    name, county, subCounty, schoolType, phone, email, motto,
    principalName, principalEmail, principalPhone,
  } = body;

  if (!name || !principalName || !principalEmail) {
    return NextResponse.json({ error: "name, principalName, and principalEmail are required" }, { status: 400 });
  }

  const school = await prisma.school.create({
    data: {
      clerkOrgId: `pending_${Date.now()}`,
      name,
      status: "pending_review",
      county: county || null,
      subCounty: subCounty || null,
      schoolType: schoolType || "primary",
      phone: phone || null,
      email: email || null,
      motto: motto || null,
      staff: {
        create: {
          name: principalName,
          email: principalEmail,
          phone: principalPhone || null,
          role: "PRINCIPAL",
        },
      },
    },
    include: {
      staff: true,
    },
  });

  return NextResponse.json(school, { status: 201 });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { staff: putStaff, debug: putDebug } = await ensureStaffRecord(userId);
  if (!putStaff || putStaff.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden", debug: putDebug, role: putStaff?.role, userId }, { status: 403 });
  }

  const body = await req.json();
  const { schoolId, status } = body;

  if (!schoolId || !status) {
    return NextResponse.json({ error: "schoolId and status are required" }, { status: 400 });
  }

  if (!["active", "rejected", "suspended"].includes(status)) {
    return NextResponse.json({ error: "status must be active, rejected, or suspended" }, { status: 400 });
  }

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: { status },
  });

  return NextResponse.json(school);
}
