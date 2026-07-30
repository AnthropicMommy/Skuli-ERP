import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import Link from "next/link";

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

export default async function ReportsPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-[var(--text-tertiary)]">No school configured.</div>;

  const students = await prisma.student.findMany({
    where: { schoolId },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  const grades = [...new Set(students.map((s) => s.grade))].sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
        <p className="text-[var(--text-tertiary)] mt-1">View student report cards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grades.map((grade) => {
          const gradeStudents = students.filter((s) => s.grade === grade);
          return (
            <div key={grade} className="rounded-xl border border-border bg-[var(--surface)] p-5">
              <h3 className="font-semibold text-[var(--text-primary)]">{grade}</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">{gradeStudents.length} students</p>
              <div className="mt-3 space-y-1">
                {gradeStudents.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/report/${s.id}`}
                    target="_blank"
                    className="block text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {s.name}
                  </Link>
                ))}
                {gradeStudents.length > 5 && (
                  <p className="text-xs text-[var(--text-tertiary)]">+{gradeStudents.length - 5} more</p>
                )}
              </div>
            </div>
          );
        })}
        {grades.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-tertiary)]">
            No students enrolled yet.
          </div>
        )}
      </div>
    </div>
  );
}
