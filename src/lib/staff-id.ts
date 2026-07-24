import { prisma } from "./prisma";

function getAcronym(schoolName: string): string {
  const skipWords = ["the", "of", "and", "a", "an", "in", "for", "school", "academy", "institute", "college"];
  const words = schoolName
    .replace(/['']/g, "")
    .split(/\s+/)
    .filter((w) => !skipWords.includes(w.toLowerCase()) && w.length > 1);

  if (words.length === 0) return "SC";

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export async function generateStaffId(schoolId: string, schoolName: string): Promise<string> {
  const acronym = getAcronym(schoolName);
  const suffix = schoolId.slice(0, 6);

  const existing = await prisma.staff.findMany({
    where: { schoolId, staffId: { not: null } },
    select: { staffId: true },
    orderBy: { createdAt: "desc" },
  });

  let seq = 1;
  for (const s of existing) {
    const match = s.staffId?.match(/-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= seq) seq = num + 1;
    }
  }

  return `${acronym}-${suffix}-${String(seq).padStart(3, "0")}`;
}

export async function isSchoolJoinCodeValid(schoolId: string, code: string): Promise<boolean> {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || !school.joinCode) return false;
  return school.joinCode === code;
}
