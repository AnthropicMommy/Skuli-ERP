import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvitePrincipalForm } from "./invite-form";

export const dynamic = "force-dynamic";

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      staff: { orderBy: { name: "asc" } },
      _count: { select: { students: true, staff: true, exams: true, assignments: true } },
    },
  });

  if (!school) notFound();

  const principal = school.staff.find((s) => s.role === "PRINCIPAL");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">{school.name}</h1>
        <p className="text-sm text-black/40 mt-1">
          {school.county || "No county"} · {school.schoolType} · Created {school.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-black/40">Students</p>
          <p className="text-2xl font-bold text-black mt-1">{school._count.students}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-black/40">Staff</p>
          <p className="text-2xl font-bold text-black mt-1">{school._count.staff}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-black/40">Exams</p>
          <p className="text-2xl font-bold text-black mt-1">{school._count.exams}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-black/40">Assignments</p>
          <p className="text-2xl font-bold text-black mt-1">{school._count.assignments}</p>
        </div>
      </div>

      {/* Principal / Invite */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-black mb-3">Principal</h2>
        {principal ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">{principal.name}</p>
              <p className="text-xs text-black/40">{principal.email || "No email"} · {principal.role}</p>
            </div>
            {principal.clerkUserId ? (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                Clerk Invited
              </span>
            ) : (
              <InvitePrincipalForm schoolId={school.id} principalName={principal.name} principalEmail={principal.email} />
            )}
          </div>
        ) : (
          <p className="text-sm text-black/40">No principal assigned yet. Add a staff member with PRINCIPAL role first.</p>
        )}
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-black">Staff ({school.staff.length})</h2>
        </div>
        {school.staff.length === 0 ? (
          <div className="p-6 text-center text-sm text-black/30">No staff members yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {school.staff.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">{s.name}</p>
                  <p className="text-xs text-black/40">{s.email || "No email"} · {s.role}</p>
                </div>
                {s.clerkUserId ? (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Invited</span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">No Clerk</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
