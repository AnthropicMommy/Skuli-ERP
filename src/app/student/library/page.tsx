import { prisma } from "@/lib/prisma";
import { LibraryContent } from "@/components/library-content";

export const dynamic = "force-dynamic";

export default async function StudentLibraryPage() {
  const [books, sourceMaterials] = await Promise.all([
    prisma.libraryBook.findMany({
      orderBy: { title: "asc" },
      take: 30,
    }),
    prisma.sourceMaterial.findMany({
      where: { materialType: { not: "curriculum_design" } },
      orderBy: [{ grade: "asc" }, { subject: "asc" }],
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        materialType: true,
        fileSize: true,
        fileUrl: true,
      },
    }),
  ]);

  return (
    <LibraryContent
      initialMaterials={sourceMaterials.map((m) => ({
        ...m,
        grade: String(m.grade),
      }))}
      books={books.map((b) => ({
        ...b,
        isbn: b.isbn ?? null,
        category: b.category ?? null,
        author: b.author ?? null,
      }))}
    />
  );
}
