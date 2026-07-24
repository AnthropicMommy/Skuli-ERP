import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApproveRejectButtons } from "./approve-reject";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      staff: { select: { id: true, role: true, clerkUserId: true } },
      _count: { select: { students: true, staff: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-black">Schools</h1>
        <Link
          href="/admin/schools/new"
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition"
        >
          Add School
        </Link>
      </div>

      {schools.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-sm text-black/40 mb-4">No schools yet.</p>
          <Link
            href="/admin/schools/new"
            className="text-sm font-medium text-black hover:underline"
          >
            Create your first school
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {schools.map((school) => {
            const principal = school.staff.find((s) => s.role === "PRINCIPAL");
            const hasClerkInvite = !!principal?.clerkUserId;

            return (
              <div key={school.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-black truncate">{school.name}</p>
                      {school.status === "active" && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                      {school.status === "pending_review" && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Pending Review
                        </span>
                      )}
                      {school.status === "rejected" && (
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          Rejected
                        </span>
                      )}
                      {school.status === "suspended" && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                          Suspended
                        </span>
                      )}
                      {hasClerkInvite && (
                        <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                          Clerk Invited
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/40 mt-1">
                      {school.county || "No county"} · {school.schoolType} · {school._count.students} students · {school._count.staff} staff · Created {school.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {school.status === "pending_review" && (
                      <ApproveRejectButtons schoolId={school.id} />
                    )}
                    <Link
                      href={`/admin/schools/${school.id}`}
                      className="text-xs font-medium text-black hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
