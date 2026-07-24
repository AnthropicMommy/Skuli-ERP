import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getUserSchoolId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const staff = await prisma.staff.findFirst({
    where: { clerkUserId: userId },
    select: { schoolId: true },
  });

  return staff?.schoolId ?? null;
}
