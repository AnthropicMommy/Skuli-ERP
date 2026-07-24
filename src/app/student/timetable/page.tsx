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
        <h1 className="text-2xl font-bold text-slate-900">Timetable</h1>
        <p className="text-slate-600 mt-1">Your weekly class schedule</p>
      </div>

      <div className="space-y-6">
        {DAYS.map((day, idx) => (
          <div key={day} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">{day}</h2>
            </div>
            {byDay[idx].length > 0 ? (
              <div className="divide-y divide-slate-100">
                {byDay[idx].map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-blue-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t.subject}</p>
                        <p className="text-xs text-slate-500">{t.room || "No room assigned"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-900">{t.startTime} - {t.endTime}</p>
                      <p className="text-xs text-slate-500">{t.staff?.name || "TBA"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-400">No classes scheduled</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
