"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PortalHomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [studentName, setStudentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/portal/login");
      return;
    }

    fetch("/api/parent/student")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStudentName("your child");
        } else {
          setStudentName(data.name);
        }
        setLoading(false);
      })
      .catch(() => {
        setStudentName("your child");
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, router]);

  if (loading || !isLoaded) {
    return (
      <div className="text-center py-16">
        <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--text-tertiary)]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
        <p className="text-[var(--text-secondary)] mt-1">Here&apos;s an overview of {studentName}&apos;s school progress.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/portal/report" className="bg-[var(--surface)] rounded-xl border border-border p-5 hover:border-[var(--border-strong)] hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center border border-primary/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Report Card</p>
              <p className="text-xs text-[var(--text-tertiary)]">CBC assessment results</p>
            </div>
          </div>
        </Link>

        <Link href="/portal/attendance" className="bg-[var(--surface)] rounded-xl border border-border p-5 hover:border-[var(--border-strong)] hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--success)]/10 text-[var(--success)] rounded-lg flex items-center justify-center border border-[var(--success)]/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Attendance</p>
              <p className="text-xs text-[var(--text-tertiary)]">Track daily attendance</p>
            </div>
          </div>
        </Link>

        <Link href="/portal/assignments" className="bg-[var(--surface)] rounded-xl border border-border p-5 hover:border-[var(--border-strong)] hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--warning)]/10 text-[var(--warning)] rounded-lg flex items-center justify-center border border-[var(--warning)]/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Assignments</p>
              <p className="text-xs text-[var(--text-tertiary)]">Homework and classwork</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
