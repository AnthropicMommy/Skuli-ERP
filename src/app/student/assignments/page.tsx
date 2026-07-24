import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-600 mt-1">Your homework and classwork</p>
      </div>

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{a.subject}</span>
                  {a.dueDate && (
                    <span className="text-xs text-slate-400">
                      Due: {new Date(a.dueDate).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
            </div>
          </div>
        ))}
        {assignments.length === 0 && (
          <div className="text-center py-12 text-slate-500">No assignments posted yet.</div>
        )}
      </div>
    </div>
  );
}
