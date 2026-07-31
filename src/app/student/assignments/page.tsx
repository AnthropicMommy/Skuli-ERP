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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Assignments</h1>
        <p className="text-[var(--text-secondary)] mt-1">Your homework and classwork</p>
      </div>

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-[var(--surface)] rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">{a.title}</h3>
                {a.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{a.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium border border-primary/20">{a.subject}</span>
                  {a.dueDate && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Due: {new Date(a.dueDate).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs bg-[var(--rubric-ae)]/10 text-[var(--rubric-ae)] px-2 py-0.5 rounded-full font-medium border border-[var(--rubric-ae)]/20">Pending</span>
            </div>
          </div>
        ))}
        {assignments.length === 0 && (
          <div className="text-center py-12 text-[var(--text-tertiary)]">No assignments posted yet.</div>
        )}
      </div>
    </div>
  );
}
