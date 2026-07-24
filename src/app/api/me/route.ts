import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const staff = await prisma.staff.findFirst({
    where: { clerkUserId: userId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          motto: true,
          schoolType: true,
          county: true,
          subCounty: true,
        },
      },
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "No staff record found. Contact your school admin to be added to Skuli." }, { status: 404 });
  }

  return NextResponse.json({
    staffId: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    school: staff.school,
  });
}
