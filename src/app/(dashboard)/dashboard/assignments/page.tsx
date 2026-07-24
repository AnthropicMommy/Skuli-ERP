import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { AssignmentsList } from "@/components/assignments-list";

export default async function AssignmentsPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  const assignments = await prisma.assignment.findMany({
    where: { schoolId },
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500 mt-1">Create and manage student assignments</p>
      </div>
      <AssignmentsList assignments={assignments} schoolId={schoolId} />
    </div>
  );
}
