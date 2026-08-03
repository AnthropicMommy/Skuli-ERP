import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFileSync } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    // Only allow from localhost or with a secret
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (secret !== "skuli-seed-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonPath = path.join(process.cwd(), "prisma", "seed-source-materials.json");
    const raw = readFileSync(jsonPath, "utf-8");
    const materials = JSON.parse(raw);

    let seeded = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of materials) {
      try {
        const existing = await prisma.sourceMaterial.findFirst({
          where: {
            title: item.title.substring(0, 200),
            source: item.source,
            grade: item.grade,
          },
        });
        if (existing) {
          skipped++;
          continue;
        }

        await prisma.sourceMaterial.create({
          data: {
            title: item.title.substring(0, 200),
            subject: item.subject,
            grade: item.grade,
            materialType: item.materialType,
            source: item.source,
            fileUrl: item.fileUrl,
            fileSize: item.fileSize || 0,
            fileExtension: item.fileExtension || "pdf",
            description: `${item.source} - ${item.materialType} - Grade ${item.grade}`,
          },
        });
        seeded++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      total: materials.length,
      seeded,
      skipped,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Seed failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
