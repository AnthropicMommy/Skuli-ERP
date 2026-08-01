import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No assignments yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-4">Your teacher hasn&apos;t posted any assignments</p>
            <Link href="/student/revision-papers" className="text-xs text-primary font-medium hover:underline">Practice with revision papers instead</Link>
          </div>
        )}
      </div>
    </div>
  );
}
