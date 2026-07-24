import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const staff = await prisma.staff.findFirst({
    where: { clerkUserId: userId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          motto: true,
          schoolType: true,
        },
      },
    },
  });

  if (!staff) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">No School Assigned</h1>
          <p className="text-sm text-slate-600 mb-6">
            Your account isn&apos;t linked to any school yet. Contact your school administrator to add you to Skuli.
          </p>
          <a
            href="https://cal.com/peter-makau-scales"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black/80 transition"
          >
            Book Onboarding Call
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar
        schoolName={staff.school.name}
        userName={staff.name}
        userRole={staff.role}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
