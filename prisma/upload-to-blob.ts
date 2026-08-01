import { put } from "@vercel/blob";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CLEANED_DIR = "/workspaces/Skuli-ERP/cleaned-materials";

interface UploadResult {
  title: string;
  url: string;
  status: "uploaded" | "error" | "skipped";
  error?: string;
}

async function uploadFile(filePath: string, blobPath: string): Promise<string> {
  const buffer = readFileSync(filePath);
  const ext = extname(filePath).toLowerCase();
  const contentType = ext === ".pdf" ? "application/pdf" : "application/octet-stream";

  const blob = await put(blobPath, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return blob.url;
}

async function main() {
  console.log("=== Uploading 301 materials to Vercel Blob ===\n");

  const results: UploadResult[] = [];
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  // Get all materials from DB
  const materials = await prisma.sourceMaterial.findMany({
    select: { id: true, title: true, fileUrl: true, grade: true },
    orderBy: { grade: "asc" },
  });

  console.log(`Found ${materials.length} materials in DB`);

  for (const material of materials) {
    // Extract the local file path from fileUrl
    // fileUrl = "/api/source-materials/file/grade-7/filename.pdf"
    const urlParts = material.fileUrl.replace("/api/source-materials/file/", "").split("/");
    const dir = urlParts[0];
    const filename = decodeURIComponent(urlParts.slice(1).join("/"));

    const localPath = join(CLEANED_DIR, dir, filename);

    if (!existsSync(localPath)) {
      console.log(`  SKIP (not found): ${material.title.substring(0, 50)}`);
      skipped++;
      continue;
    }

    const blobPath = `source-materials/${dir}/${filename}`;

    try {
      const url = await uploadFile(localPath, blobPath);

      // Update DB with blob URL
      await prisma.sourceMaterial.update({
        where: { id: material.id },
        data: { fileUrl: url },
      });

      console.log(`  UPLOADED: ${material.title.substring(0, 50)}... → ${url.substring(0, 60)}...`);
      uploaded++;
      results.push({ title: material.title, url, status: "uploaded" });

      // Rate limit - small delay between uploads
      if (uploaded % 10 === 0) {
        console.log(`  ... ${uploaded} uploaded so far ...`);
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err: any) {
      console.log(`  ERROR: ${material.title.substring(0, 50)} - ${err.message?.substring(0, 80)}`);
      errors++;
      results.push({ title: material.title, url: "", status: "error", error: err.message });
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);

  // Summary
  const total = await prisma.sourceMaterial.count();
  const withBlobUrl = await prisma.sourceMaterial.count({
    where: { fileUrl: { startsWith: "https://" } },
  });
  console.log(`\nTotal in DB: ${total}`);
  console.log(`With blob URL: ${withBlobUrl}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
