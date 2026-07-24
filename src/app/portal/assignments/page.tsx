"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Assignment = { id: string; title: string; description: string | null; subject: string; dueDate: string; submittedAt: string | null };

export default function PortalAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) {
      router.push("/portal/login");
      return;
    }

    fetch("/api/parent/assignments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/portal/login");
          return;
        }
        setAssignments(data.assignments || []);
        setStudentName(data.name || "");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="text-slate-600 mt-1">{studentName}&apos;s assignments and classwork</p>
      </div>

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                {a.description && <p className="text-sm text-slate-500 mt-1">{a.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-blue-100 text-blue-700">{a.subject}</Badge>
                  <span className="text-xs text-slate-400">Due: {new Date(a.dueDate).toLocaleDateString("en-KE")}</span>
                </div>
              </div>
              <div>
                {a.submittedAt ? (
                  <Badge className="bg-emerald-100 text-emerald-700">Submitted</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
        {assignments.length === 0 && (
          <div className="text-center py-12 text-slate-500">No assignments found.</div>
        )}
      </div>
    </div>
  );
}
