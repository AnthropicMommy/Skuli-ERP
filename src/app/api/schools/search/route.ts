import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const schools = await prisma.school.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      status: "active",
    },
    select: { id: true, name: true },
    take: 10,
  });

  return NextResponse.json(schools);
}
