import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [totalSchools, pendingSchools, activeSchools, totalStudents, totalStaff, recentSchools] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { status: "pending_review" } }),
    prisma.school.count({ where: { status: "active" } }),
    prisma.student.count(),
    prisma.staff.count(),
    prisma.school.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { students: true, staff: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-black mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm text-black/40">Schools</p>
          <p className="text-3xl font-bold text-black mt-1">{totalSchools}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm text-black/40">Pending Review</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingSchools}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm text-black/40">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{activeSchools}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-sm text-black/40">Students / Staff</p>
          <p className="text-3xl font-bold text-black mt-1">{totalStudents} / {totalStaff}</p>
        </div>
      </div>

      {pendingSchools > 0 && (
        <Link
          href="/admin/schools"
          className="block bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 hover:bg-amber-100 transition"
        >
          <p className="text-sm font-medium text-amber-800">
            {pendingSchools} school{pendingSchools > 1 ? "s" : ""} pending review
          </p>
          <p className="text-xs text-amber-600 mt-1">Click to review and approve</p>
        </Link>
      )}

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-black">Recent Schools</h2>
        </div>
        {recentSchools.length === 0 ? (
          <div className="p-8 text-center text-sm text-black/30">
            No schools yet. Create your first school to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSchools.map((school) => (
              <div key={school.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-black">{school.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      school.status === "active" ? "bg-emerald-50 text-emerald-700" :
                      school.status === "pending_review" ? "bg-amber-50 text-amber-700" :
                      "bg-slate-100 text-slate-500"
                    }`}>
                      {school.status}
                    </span>
                  </div>
                  <p className="text-xs text-black/40">{school.county || "No county"} · {school._count.students} students · {school._count.staff} staff</p>
                </div>
                <span className="text-xs text-black/30">
                  {school.createdAt.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
