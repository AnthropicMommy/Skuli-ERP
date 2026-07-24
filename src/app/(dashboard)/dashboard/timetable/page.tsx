import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { TimetableView } from "@/components/timetable-view";

export default async function TimetablePage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  const students = await prisma.student.findMany({
    where: { schoolId },
    select: { grade: true },
  });
  const grades = [...new Set(students.map((s) => s.grade))].sort();

  const timetable = await prisma.timetable.findMany({
    where: { schoolId },
    include: { staff: { select: { name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
  });

  const staff = await prisma.staff.findMany({
    where: { schoolId },
    select: { id: true, name: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-500 mt-1">View and manage class schedules</p>
      </div>
      <TimetableView grades={grades} timetable={timetable} staff={staff} schoolId={schoolId} />
    </div>
  );
}
