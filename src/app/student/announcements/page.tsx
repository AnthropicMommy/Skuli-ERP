import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Announcements</h1>
        <p className="text-[var(--text-secondary)] mt-1">School news and updates</p>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-[var(--surface)] rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)]">{a.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {new Date(a.createdAt).toLocaleDateString("en-KE", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {a.authorName && (
                    <span className="text-xs text-[var(--text-tertiary)]">by {a.authorName}</span>
                  )}
                  {a.classId && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Class-specific</span>
                  )}
                </div>
              </div>
              {a.priority === "urgent" && (
                <span className="text-xs bg-[var(--destructive)]/10 text-[var(--destructive)] px-2 py-0.5 rounded-full font-medium ml-3 border border-[var(--destructive)]/20">
                  Urgent
                </span>
              )}
              {a.priority === "high" && (
                <span className="text-xs bg-[var(--rubric-ae)]/10 text-[var(--rubric-ae)] px-2 py-0.5 rounded-full font-medium ml-3 border border-[var(--rubric-ae)]/20">
                  Important
                </span>
              )}
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-[var(--text-tertiary)]">No announcements yet.</div>
        )}
      </div>
    </div>
  );
}
