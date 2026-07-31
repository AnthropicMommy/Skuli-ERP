const { PrismaClient } = require("../src/generated/prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("=== Seeding SourceMaterials ===\n");
  
  const metadata = JSON.parse(
    fs.readFileSync("/workspaces/Skuli-ERP/cleaned-materials/metadata.json", "utf8")
  );
  
  console.log(`Found ${metadata.length} materials to seed`);
  
  // Get the Skuli Open Learning school ID
  const school = await prisma.school.findFirst({
    where: { clerkOrgId: "skuli-open-learning" },
  });
  
  if (!school) {
    console.log("Creating Skuli Open Learning school...");
    const newSchool = await prisma.school.create({
      data: {
        clerkOrgId: "skuli-open-learning",
        name: "Skuli Open Learning",
        status: "active",
        schoolType: "primary",
      },
    });
    console.log(`Created school: ${newSchool.id}`);
  }
  
  const schoolId = school?.id || (await prisma.school.findFirst({ where: { clerkOrgId: "skuli-open-learning" } }))?.id;
  
  let seeded = 0;
  let skipped = 0;
  
  for (const item of metadata) {
    try {
      // Check if already exists
      const existing = await prisma.sourceMaterial.findFirst({
        where: {
          title: item.title,
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
          fileExtension: "pdf",
          sourceUrl: null,
          description: `${item.source} - ${item.materialType} - Grade ${item.grade}`,
        },
      });
      
      seeded++;
      if (seeded % 50 === 0) console.log(`  Seeded ${seeded}...`);
      
    } catch (err) {
      console.log(`  Error seeding ${item.title}: ${err.message}`);
      skipped++;
    }
  }
  
  console.log(`\n=== Done: ${seeded} seeded, ${skipped} skipped ===`);
  
  // Summary
  const total = await prisma.sourceMaterial.count();
  console.log(`Total SourceMaterials in DB: ${total}`);
  
  const byGrade = await prisma.sourceMaterial.groupBy({
    by: ["grade"],
    _count: true,
    orderBy: { grade: "asc" },
  });
  console.log("\nBy Grade:");
  for (const g of byGrade) console.log(`  ${g.grade}: ${g._count}`);
  
  const bySource = await prisma.sourceMaterial.groupBy({
    by: ["source"],
    _count: true,
  });
  console.log("\nBy Source:");
  for (const s of bySource) console.log(`  ${s.source}: ${s._count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
