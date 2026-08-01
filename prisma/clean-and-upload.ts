import "dotenv/config";
import { put } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CLEANED_DIR = "/workspaces/Skuli-ERP/cleaned-materials";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

function cleanTitle(title: string): string {
  let t = title;
  // Remove source branding
  t = t.replace(/\s*TEACHER\.CO\s*\.?\s*KE\s*\.pdf/gi, "");
  t = t.replace(/\s*FREEEXAMS\.CO\.KE\s*\.pdf/gi, "");
  t = t.replace(/\s*KCSEREVISION\.COM/gi, "");
  t = t.replace(/\s*TEACHER\.CO\s*\.?\s*KE/gi, "");
  // Remove file extension
  t = t.replace(/\.pdf$/i, "");
  // Fix double spaces
  t = t.replace(/\s{2,}/g, " ").trim();
  // Title case
  t = t.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return t;
}

async function main() {
  const raw = readFileSync(`${CLEANED_DIR}/metadata.json`, "utf8");
  const materials = JSON.parse(raw) as Array<{
    title: string;
    grade: number;
    subject: string;
    materialType: string;
    source: string;
    fileUrl: string;
    fileSize: number;
    pages: number;
  }>;

  console.log(`Processing ${materials.length} materials...\n`);

  // Clean titles
  for (const m of materials) {
    m.title = cleanTitle(m.title);
  }

  // Save cleaned metadata
  writeFileSync(`${CLEANED_DIR}/metadata.json`, JSON.stringify(materials, null, 2));
  console.log("Saved cleaned metadata.json\n");

  // Get DB materials for matching
  const dbMaterials = await prisma.sourceMaterial.findMany({
    select: { id: true, fileUrl: true },
  });

  console.log(`DB materials: ${dbMaterials.length}`);
  console.log(`\n=== Uploading to Vercel Blob ===\n`);

  let uploaded = 0;
  let errors = 0;
  let skipped = 0;

  for (const m of materials) {
    // Find matching DB record
    const dbMatch = dbMaterials.find((db) => db.fileUrl === m.fileUrl);
    if (!dbMatch) {
      skipped++;
      continue;
    }

    // Extract local path from fileUrl
    const urlParts = m.fileUrl.replace("/api/source-materials/file/", "").split("/");
    const dir = urlParts[0];
    const filename = decodeURIComponent(urlParts.slice(1).join("/"));
    const localPath = join(CLEANED_DIR, dir, filename);

    if (!existsSync(localPath)) {
      skipped++;
      continue;
    }

    const blobPath = `source-materials/${dir}/${filename}`;

    try {
      const buffer = readFileSync(localPath);
      const blob = await put(blobPath, buffer, {
        access: "public",
        contentType: "application/pdf",
        addRandomSuffix: false,
        token: BLOB_TOKEN,
      });

      // Update DB: blob URL + cleaned title
      await prisma.sourceMaterial.update({
        where: { id: dbMatch.id },
        data: { fileUrl: blob.url, title: m.title },
      });

      uploaded++;
      if (uploaded % 25 === 0) {
        console.log(`  ... ${uploaded} uploaded ...`);
      }
    } catch (err: any) {
      console.log(`  ERROR: ${m.title.substring(0, 50)} - ${err.message?.substring(0, 100)}`);
      errors++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);

  const total = await prisma.sourceMaterial.count();
  const withBlobUrl = await prisma.sourceMaterial.count({
    where: { fileUrl: { startsWith: "https://" } },
  });
  console.log(`\nTotal in DB: ${total}`);
  console.log(`With blob URL: ${withBlobUrl}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
