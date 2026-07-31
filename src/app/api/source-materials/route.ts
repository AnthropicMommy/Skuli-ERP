import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const grade = url.searchParams.get("grade");
  const subject = url.searchParams.get("subject");
  const materialType = url.searchParams.get("materialType");
  const source = url.searchParams.get("source");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (grade) where.grade = grade;
  if (subject) where.subject = subject;
  if (materialType) where.materialType = materialType;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
    ];
  }

  const materials = await prisma.sourceMaterial.findMany({
    where,
    orderBy: [{ grade: "asc" }, { subject: "asc" }, { title: "asc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      subject: true,
      grade: true,
      materialType: true,
      source: true,
      fileSize: true,
      fileExtension: true,
      downloadCount: true,
      createdAt: true,
    },
  });

  // Get unique values for filters
  const dbGrades = await prisma.sourceMaterial.findMany({
    select: { grade: true }, distinct: ["grade"], orderBy: { grade: "asc" },
  });
  const dbSubjects = await prisma.sourceMaterial.findMany({
    select: { subject: true }, distinct: ["subject"], orderBy: { subject: "asc" },
  });
  const dbTypes = await prisma.sourceMaterial.findMany({
    select: { materialType: true }, distinct: ["materialType"], orderBy: { materialType: "asc" },
  });

  return NextResponse.json({
    materials,
    filters: {
      grades: dbGrades.map(g => g.grade),
      subjects: dbSubjects.map(s => s.subject),
      types: dbTypes.map(t => t.materialType),
    },
  });
}
