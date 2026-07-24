import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import Link from "next/link";

export default async function ReportsPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  const students = await prisma.student.findMany({
    where: { schoolId },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  const grades = [...new Set(students.map((s) => s.grade))].sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and view school reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grades.map((grade) => {
          const gradeStudents = students.filter((s) => s.grade === grade);
          return (
            <div key={grade} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">{grade}</h3>
              <p className="text-sm text-gray-500 mt-1">{gradeStudents.length} students</p>
              <div className="mt-3 space-y-1">
                {gradeStudents.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    href={`/report/${s.id}`}
                    className="block text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    {s.name} →
                  </Link>
                ))}
                {gradeStudents.length > 3 && (
                  <p className="text-xs text-gray-400">+{gradeStudents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
        {grades.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No students enrolled yet. Add students to generate reports.
          </div>
        )}
      </div>
    </div>
  );
}
