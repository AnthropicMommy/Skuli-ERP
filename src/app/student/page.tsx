"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MwalimuCharacter } from "@/components/mwalimu-character";

interface StudentData {
  name: string;
  grade: string;
  isIndependent: boolean;
  hasProfile: boolean;
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) {
      window.location.href = "/student-login";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isIndependent = payload.isIndependent === true;

      setData({
        name: payload.name || "Student",
        grade: payload.grade || "?",
        isIndependent,
        hasProfile: true,
      });

      if (isIndependent) {
        setLoading(false);
      }
    } catch {}

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome, {data?.name}!</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Grade {data?.grade}
          {data?.isIndependent && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Independent Learner</span>}
        </p>
      </div>

      {/* Mwalimu Hero */}
      <Link href="/student/mwalimu" className="block mb-8 group">
        <div className="bg-[var(--surface)] border border-border rounded-2xl p-6 flex items-center gap-6 hover:border-primary/30 transition-all">
          <MwalimuCharacter size="lg" message={`Hey ${data?.name?.split(" ")[0] || "there"}! Ready to learn?`} />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors">Mwalimu AI</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Your personal learning assistant. Ask anything, take tests, track your progress.</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              Start learning
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/student/mwalimu" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
              </svg>
              Mwalimu AI
            </Link>
            <Link href="/student/my-tests" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              My Tests
            </Link>
            <Link href="/student/library" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Library
            </Link>
            <Link href="/student/study-timetable" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Timetable
            </Link>
            {!data?.isIndependent && (
              <>
                <Link href="/student/assignments" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--text-secondary)]">
                  <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  Assignments
                </Link>
                <Link href="/student/announcements" className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-colors text-sm font-medium text-[var(--text-secondary)]">
                  <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  Announcements
                </Link>
              </>
            )}
          </div>
        </div>

        {!data?.isIndependent && (
          <div className="bg-[var(--surface)] border border-border rounded-xl p-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Currently Reading</h2>
            <div className="text-center py-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-primary/20">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">No books checked out yet</p>
              <Link href="/student/library" className="text-xs text-primary font-medium hover:underline">Browse the Library</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
