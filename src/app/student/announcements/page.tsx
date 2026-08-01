import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No announcements yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-4">Check back later for school updates</p>
            <Link href="/student/library" className="text-xs text-primary font-medium hover:underline">Browse the Library while you wait</Link>
          </div>
        )}
      </div>
    </div>
  );
}
