import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentLibraryPage() {
  const books = await prisma.libraryBook.findMany({
    orderBy: { title: "asc" },
    take: 30,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">School Library</h1>
        <p className="text-slate-600 mt-1">Browse available books and resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">{book.title}</h3>
            {book.author && <p className="text-sm text-slate-500 mt-1">by {book.author}</p>}
            <div className="flex items-center gap-3 mt-3">
              {book.isbn && <span className="text-xs text-slate-400">ISBN: {book.isbn}</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                book.available > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}>
                {book.available} of {book.copies} available
              </span>
            </div>
            {book.category && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-2 inline-block">{book.category}</span>
            )}
          </div>
        ))}
        {books.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">No books in the library yet.</div>
        )}
      </div>
    </div>
  );
}
