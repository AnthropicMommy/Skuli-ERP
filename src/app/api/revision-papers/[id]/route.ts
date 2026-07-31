import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const paper = await prisma.revisionPaper.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      grade: true,
      subject: true,
      term: true,
      assessmentType: true,
      year: true,
      content: true,
    },
  });

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  // Increment download count
  await prisma.revisionPaper.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });

  // Parse content if it's JSON string
  let parsedContent = null;
  if (paper.content) {
    try {
      parsedContent = JSON.parse(paper.content);
    } catch {
      parsedContent = paper.content;
    }
  }

  return NextResponse.json({ paper: { ...paper, content: parsedContent } });
}
