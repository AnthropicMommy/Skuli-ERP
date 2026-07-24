import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isLeadership } from "@/lib/roles";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  const school = await prisma.school.findUnique({ where: { id: staff.schoolId } });
  if (!school) return NextResponse.json({ error: "School not found" }, { status: 404 });

  return NextResponse.json(school);
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "No staff record" }, { status: 404 });

  if (!isLeadership(staff.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const { name, motto, phone, email, address, county, subCounty, schoolType } = body;

  const school = await prisma.school.update({
    where: { id: staff.schoolId },
    data: {
      ...(name !== undefined && { name }),
      ...(motto !== undefined && { motto }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(county !== undefined && { county }),
      ...(subCounty !== undefined && { subCounty }),
      ...(schoolType !== undefined && { schoolType }),
    },
  });

  return NextResponse.json(school);
}
