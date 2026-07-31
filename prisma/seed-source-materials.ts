import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Seeding SourceMaterials ===\n");
  
  const metadata = JSON.parse(
    readFileSync("/workspaces/Skuli-ERP/cleaned-materials/metadata.json", "utf8")
  );
  
  console.log(`Found ${metadata.length} materials to seed`);
  
  let seeded = 0;
  let skipped = 0;
  
  for (const item of metadata) {
    try {
      const existing = await prisma.sourceMaterial.findFirst({
        where: { title: item.title.substring(0, 200), source: item.source, grade: item.grade },
      });
      if (existing) { skipped++; continue; }
      
      await prisma.sourceMaterial.create({
        data: {
          title: item.title.substring(0, 200),
          subject: item.subject,
          grade: item.grade,
          materialType: item.materialType,
          source: item.source,
          fileUrl: item.fileUrl,
          fileSize: item.fileSize || 0,
          fileExtension: "pdf",
          description: `${item.source} - ${item.materialType} - Grade ${item.grade}`,
        },
      });
      seeded++;
      if (seeded % 50 === 0) console.log(`  Seeded ${seeded}...`);
    } catch (err: any) {
      skipped++;
    }
  }
  
  console.log(`\n=== Done: ${seeded} seeded, ${skipped} skipped ===`);
  
  const total = await prisma.sourceMaterial.count();
  console.log(`Total SourceMaterials in DB: ${total}`);
  
  const byGrade = await prisma.sourceMaterial.groupBy({ by: ["grade"], _count: true, orderBy: { grade: "asc" } });
  console.log("\nBy Grade:");
  for (const g of byGrade) console.log(`  ${g.grade}: ${g._count}`);
  
  const bySource = await prisma.sourceMaterial.groupBy({ by: ["source"], _count: true });
  console.log("\nBy Source:");
  for (const s of bySource) console.log(`  ${s.source}: ${s._count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
