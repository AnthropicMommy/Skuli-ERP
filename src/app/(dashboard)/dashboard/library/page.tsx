import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { LibraryDashboard } from "@/components/library-dashboard";

export default async function LibraryPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  const books = await prisma.libraryBook.findMany({
    where: { schoolId },
    orderBy: { title: "asc" },
  });

  const activeTransactions = await prisma.libraryTransaction.findMany({
    where: { returnDate: null, book: { schoolId } },
    include: { book: true },
  });

  const students = await prisma.student.findMany({
    where: { schoolId },
    select: { id: true, name: true, admissionNo: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <p className="text-gray-500 mt-1">Manage books, issues, and returns</p>
      </div>
      <LibraryDashboard books={books} transactions={activeTransactions} students={students} schoolId={schoolId} />
    </div>
  );
}
