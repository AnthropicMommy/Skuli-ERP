import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { SendNotificationForm } from "@/components/send-notification-form";

export default async function NotificationsPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  const notifications = await prisma.notification.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Send SMS notifications to parents and staff</p>
      </div>

      <SendNotificationForm schoolId={schoolId} />

      <div className="bg-white rounded-xl border border-gray-200 mt-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Notification History</h2>
        </div>
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-3xl block mb-2">🔔</span>
            No notifications sent yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">
                    {n.type === "attendance_alert" ? "✅" : n.type === "result" ? "📋" : "📣"}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.createdAt.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })} · {n.channel}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
