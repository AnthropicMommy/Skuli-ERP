import { prisma } from "@/lib/prisma";
import { StudentMaterials } from "@/components/student-materials";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentLibraryPage() {
  const books = await prisma.libraryBook.findMany({
    orderBy: { title: "asc" },
    take: 30,
  });

  // Get source materials grouped by grade
  const sourceMaterials = await prisma.sourceMaterial.findMany({
    orderBy: [{ grade: "asc" }, { subject: "asc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      subject: true,
      grade: true,
      materialType: true,
      source: true,
      fileSize: true,
      fileUrl: true,
    },
  });

  // Group by grade
  const byGrade: Record<string, typeof sourceMaterials> = {};
  for (const m of sourceMaterials) {
    if (!byGrade[m.grade]) byGrade[m.grade] = [];
    byGrade[m.grade].push(m);
  }

  const gradeOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "KCSE", "KJSEA"];
  const sortedGrades = gradeOrder.filter(g => byGrade[g]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Study Library</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {sourceMaterials.length}+ real curriculum materials from teacher.co.ke and freeexams.co.ke
        </p>
      </div>

      <div className="space-y-10">
        {/* Source Materials Section */}
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Revision Papers & Notes ({sourceMaterials.length})
          </h2>
          
          {/* Filter tabs by grade */}
          <div className="flex flex-wrap gap-2 mb-6">
            {sortedGrades.map(grade => (
              <div key={grade} className="text-xs bg-[var(--surface)] border border-border rounded-lg px-3 py-1.5 text-[var(--text-secondary)]">
                Grade {grade}: <span className="font-semibold text-[var(--accent)]">{byGrade[grade].length}</span>
              </div>
            ))}
          </div>

          {/* Materials grid by grade */}
          {sortedGrades.map(grade => (
            <div key={grade} className="mb-8">
              <h3 className="text-md font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-sm font-bold">
                  {grade}
                </span>
                Grade {grade}
                <span className="text-sm font-normal text-[var(--text-tertiary)]">
                  ({byGrade[grade].length} materials)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {byGrade[grade].map(material => (
                  <Link
                    key={material.id}
                    href={material.fileUrl}
                    target="_blank"
                    className="bg-[var(--surface)] rounded-xl border border-border p-4 hover:border-[var(--accent)]/50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--accent)]">
                          {material.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{material.subject}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-2 flex-shrink-0 ${
                        material.materialType === "past_paper"
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : material.materialType === "curriculum_design"
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      }`}>
                        {material.materialType === "past_paper" ? "Past Paper" :
                         material.materialType === "curriculum_design" ? "Curriculum" :
                         material.materialType === "scheme" ? "Scheme" :
                         material.materialType === "exam_paper" ? "Exam" : "Notes"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-tertiary)]">
                      <span>{material.source}</span>
                      {material.fileSize != null && material.fileSize > 0 && (
                        <span>{(material.fileSize / 1024).toFixed(0)}KB</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          {sourceMaterials.length === 0 && (
            <div className="text-center py-8 text-[var(--text-tertiary)]">
              Materials loading...
            </div>
          )}
        </section>

        <hr className="border-border" />

        {/* School Library */}
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">School Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div key={book.id} className="bg-[var(--surface)] rounded-xl border border-border p-5">
                <h3 className="font-semibold text-[var(--text-primary)]">{book.title}</h3>
                {book.author && <p className="text-sm text-[var(--text-secondary)] mt-1">by {book.author}</p>}
                <div className="flex items-center gap-3 mt-3">
                  {book.isbn && <span className="text-xs text-[var(--text-tertiary)]">ISBN: {book.isbn}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    book.available > 0
                      ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                      : "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"
                  }`}>
                    {book.available} of {book.copies} available
                  </span>
                </div>
                {book.category && (
                  <span className="text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full mt-2 inline-block border border-border">{book.category}</span>
                )}
              </div>
            ))}
            {books.length === 0 && (
              <div className="col-span-full text-center py-8 text-[var(--text-tertiary)]">No books in the catalog yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
