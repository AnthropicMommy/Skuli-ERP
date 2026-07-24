import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { AttendanceChart, GradeDistributionChart, RubricDistributionChart, StaffByRoleChart } from "@/components/dashboard-charts";

export default async function AnalyticsPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  // Attendance data (last 7 days)
  const attendanceData: { date: string; present: number; absent: number; late: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const label = d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric" });

    const present = await prisma.attendance.count({ where: { date: d, status: "PRESENT", student: { schoolId } } });
    const absent = await prisma.attendance.count({ where: { date: d, status: "ABSENT", student: { schoolId } } });
    const late = await prisma.attendance.count({ where: { date: d, status: "LATE", student: { schoolId } } });

    attendanceData.push({ date: label, present, absent, late });
  }

  // Students by grade
  const students = await prisma.student.findMany({ where: { schoolId } });
  const gradeMap = new Map<string, number>();
  for (const s of students) {
    gradeMap.set(s.grade, (gradeMap.get(s.grade) || 0) + 1);
  }
  const gradeData = Array.from(gradeMap.entries())
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => a.grade.localeCompare(b.grade));

  // CBC rubric distribution
  const cbcResults = await prisma.cbcResult.findMany({
    where: { student: { schoolId } },
  });
  const rubricMap = new Map<string, number>();
  for (const r of cbcResults) {
    rubricMap.set(r.rubricLevel, (rubricMap.get(r.rubricLevel) || 0) + 1);
  }
  const rubricOrder = ["EE1", "EE2", "ME1", "ME2", "AE1", "AE2", "BE1", "BE2"];
  const rubricData = rubricOrder
    .filter((l) => rubricMap.has(l))
    .map((level) => ({ level, count: rubricMap.get(level) || 0 }));

  // Staff by role
  const staff = await prisma.staff.findMany({ where: { schoolId } });
  const roleMap = new Map<string, number>();
  for (const s of staff) {
    roleMap.set(s.role, (roleMap.get(s.role) || 0) + 1);
  }
  const roleData = Array.from(roleMap.entries())
    .map(([role, count]) => ({ role: role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Insights into school performance and attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={attendanceData} />
        <GradeDistributionChart data={gradeData} />
        <RubricDistributionChart data={rubricData} />
        <StaffByRoleChart data={roleData} />
      </div>
    </div>
  );
}
