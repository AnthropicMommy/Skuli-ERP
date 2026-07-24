import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        <p className="text-slate-600 mt-1">School news and updates</p>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString("en-KE", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {a.authorName && (
                    <span className="text-xs text-slate-400">by {a.authorName}</span>
                  )}
                </div>
              </div>
              {a.priority === "urgent" && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium ml-3">
                  Urgent
                </span>
              )}
              {a.priority === "high" && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-3">
                  Important
                </span>
              )}
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-slate-500">No announcements yet.</div>
        )}
      </div>
    </div>
  );
}
