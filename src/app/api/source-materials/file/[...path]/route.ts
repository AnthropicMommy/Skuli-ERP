import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const CLEANED_DIR = "/workspaces/Skuli-ERP/cleaned-materials";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathParts } = await params;
  
  // pathParts = ["grade-7", "filename.pdf"] or ["jss-designs", "filename.pdf"]
  if (pathParts.length < 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  
  const dir = pathParts[0];
  const filename = decodeURIComponent(pathParts.slice(1).join("/"));
  
  const filePath = join(CLEANED_DIR, dir, filename);
  
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  
  const fileBuffer = readFileSync(filePath);
  const ext = filename.split(".").pop()?.toLowerCase() || "pdf";
  
  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
