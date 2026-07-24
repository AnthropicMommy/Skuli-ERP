import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  const staff = await prisma.staff.findFirst({
    where: { clerkUserId: userId! },
    include: {
      school: {
        include: {
          _count: {
            select: { students: true, staff: true, assignments: true, exams: true },
          },
        },
      },
    },
  });

  if (!staff) return null;

  const { school } = staff;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayAttendance, presentToday, unreadNotifications] = await Promise.all([
    prisma.attendance.count({ where: { date: today } }),
    prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
    prisma.notification.count({ where: { read: false } }),
  ]);

  const isEmpty = school._count.students === 0 && school._count.staff <= 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{school.name}</h1>
        <p className="text-slate-500 mt-1">Welcome back, {staff.name}</p>
      </div>

      {isEmpty && (
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 border border-slate-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Get started with {school.name}</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your school is set up but has no data yet. Add staff, create classes, and enroll students to get started.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a href="/dashboard/staff" className="text-xs font-medium text-slate-900 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  Add Staff
                </a>
                <a href="/dashboard/students" className="text-xs font-medium text-slate-900 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  Add Students
                </a>
                <a href="/dashboard/exams" className="text-xs font-medium text-slate-900 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  Create Exams
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Students</p>
              <p className="text-2xl font-bold text-slate-900">{school._count.students}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 015 17.119V5a2 2 0 012-2h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Staff</p>
              <p className="text-2xl font-bold text-slate-900">{school._count.staff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Exams</p>
              <p className="text-2xl font-bold text-slate-900">{school._count.exams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Assignments</p>
              <p className="text-2xl font-bold text-slate-900">{school._count.assignments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Today&apos;s Attendance</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {todayAttendance > 0 ? Math.round((presentToday / todayAttendance) * 100) : 0}%
            </span>
            <span className="text-sm text-slate-500 mb-1">
              ({presentToday}/{todayAttendance})
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${todayAttendance > 0 ? (presentToday / todayAttendance) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500">Notifications</h3>
            <a href="/dashboard/notifications" className="text-xs text-slate-400 hover:text-slate-600">View All</a>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{unreadNotifications}</span>
            <span className="text-sm text-slate-500 mb-1">unread</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <a href="/dashboard/staff" className="text-xs font-medium text-slate-900 hover:text-slate-700 px-2 py-1 rounded bg-slate-50 text-center">
              Add Staff
            </a>
            <a href="/dashboard/students" className="text-xs font-medium text-slate-900 hover:text-slate-700 px-2 py-1 rounded bg-slate-50 text-center">
              Add Student
            </a>
            <a href="/dashboard/exams" className="text-xs font-medium text-pink-600 hover:text-pink-700 px-2 py-1 rounded bg-pink-50 text-center">
              Enter Marks
            </a>
            <a href="/dashboard/attendance" className="text-xs font-medium text-green-600 hover:text-green-700 px-2 py-1 rounded bg-green-50 text-center">
              Mark Attendance
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="text-sm text-slate-500 text-center py-8">
          Activity will appear here as you use the system.
        </div>
      </div>
    </div>
  );
}
