import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { AttendanceGrid } from "@/components/attendance-grid";

export default async function AttendancePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">Mark daily attendance for your students</p>
      </div>
      <AttendanceGrid students={students} grades={grades} />
    </div>
  );
}
