import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentTimetablePage() {
  const timetable = await prisma.timetable.findMany({
    include: { staff: { select: { name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    take: 50,
  });

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Group by dayOfWeek
  const byDay: Record<number, typeof timetable> = {};
  for (let i = 0; i < 5; i++) {
    byDay[i] = timetable.filter((t) => t.dayOfWeek === i);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Timetable</h1>
        <p className="text-[var(--text-secondary)] mt-1">Your weekly class schedule</p>
      </div>

      <div className="space-y-6">
        {DAYS.map((day, idx) => (
          <div key={day} className="bg-[var(--surface)] rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-hover)] border-b border-border">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">{day}</h2>
            </div>
            {byDay[idx].length > 0 ? (
              <div className="divide-y divide-border">
                {byDay[idx].map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-primary rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{t.subject}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{t.room || "No room assigned"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[var(--text-primary)]">{t.startTime} - {t.endTime}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t.staff?.name || "TBA"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">No classes scheduled</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
