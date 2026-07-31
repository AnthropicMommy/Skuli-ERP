import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const school = await prisma.school.upsert({
    where: { id: "skuli-open-learning" },
    update: {},
    create: {
      id: "skuli-open-learning",
      clerkOrgId: "skuli-open-learning",
      name: "Skuli Open Learning",
      email: "open@skuli.co.ke",
      phone: "+254700000000",
      address: "Nairobi, Kenya",
      status: "active",
      plan: "TRIAL",
    },
  });

  console.log("Seeded school:", school.name, school.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
