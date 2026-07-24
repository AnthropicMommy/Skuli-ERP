"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StudentData {
  name: string;
  grade: string;
  class: { id: string; name: string; _count: { students: number } } | null;
  pendingAssignments: number;
  currentBooks: { title: string; author: string }[];
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) return;

    Promise.all([
      fetch("/api/auth/student", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }).catch(() => null),
    ]).then(() => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setData({
          name: payload.name || "Student",
          grade: payload.grade || "?",
          class: null,
          pendingAssignments: 0,
          currentBooks: [],
        });
      } catch {}
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-16"><div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {data?.name}!</h1>
        <p className="text-slate-600 mt-1">Grade {data?.grade} · {data?.class?.name || "No class assigned yet"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">My Class</p>
              <p className="text-lg font-bold text-slate-900">{data?.class?._count.students || 0} classmates</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75a.75.75 0 00-.75.75v1.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500">Ask Mwalimu</p>
              <p className="text-lg font-bold text-slate-900">AI Tutor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/student/assignments" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Assignments
            </Link>
            <Link href="/student/library" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Library
            </Link>
            <Link href="/student/timetable" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Timetable
            </Link>
            <Link href="/student/announcements" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
              <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              Announcements
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Currently Reading</h2>
          {data?.currentBooks && data.currentBooks.length > 0 ? (
            <div className="space-y-2">
              {data.currentBooks.map((book, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <span className="text-lg">📖</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No books checked out yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
