import { prisma } from "@/lib/prisma";
import { StudentMaterials } from "@/components/student-materials";

export const dynamic = "force-dynamic";

export default async function StudentLibraryPage() {
  const books = await prisma.libraryBook.findMany({
    orderBy: { title: "asc" },
    take: 30,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">School Library</h1>
        <p className="text-[var(--text-secondary)] mt-1">Browse revision materials and available books</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Study Materials</h2>
          <StudentMaterials studentId="" />
        </section>

        <hr className="border-border" />

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Book Catalog</h2>
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
