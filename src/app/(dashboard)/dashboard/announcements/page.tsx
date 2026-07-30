import { prisma } from "@/lib/prisma";
import { getUserSchoolId } from "@/lib/school";
import { AnnouncementManager } from "@/components/announcement-manager";

export default async function AnnouncementsPage() {
  const schoolId = await getUserSchoolId();
  if (!schoolId) return <div className="p-8 text-gray-500">No school configured.</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">Create and manage school announcements</p>
      </div>
      <AnnouncementManager schoolId={schoolId} />
    </div>
  );
}
