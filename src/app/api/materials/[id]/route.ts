import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findFirst({ where: { clerkUserId: userId } });
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (material.organizationId !== staff.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.material.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
