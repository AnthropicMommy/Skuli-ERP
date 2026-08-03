import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (secret !== "skuli-seed-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.sourceMaterial.deleteMany({
      where: { materialType: "notes" },
    });

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    return NextResponse.json({ error: "Failed", detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
