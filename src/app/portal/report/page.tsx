"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const RUBRIC_INFO: Record<string, { pts: number; desc: string; color: string }> = {
  EE1: { pts: 8, desc: "Exceeding Expectations", color: "bg-emerald-100 text-emerald-800" },
  EE2: { pts: 7, desc: "Exceeding Expectations", color: "bg-emerald-50 text-emerald-700" },
  ME1: { pts: 6, desc: "Meeting Expectations", color: "bg-blue-100 text-blue-800" },
  ME2: { pts: 5, desc: "Meeting Expectations", color: "bg-blue-50 text-blue-700" },
  AE1: { pts: 4, desc: "Approaching Expectations", color: "bg-amber-100 text-amber-800" },
  AE2: { pts: 3, desc: "Approaching Expectations", color: "bg-amber-50 text-amber-700" },
  BE1: { pts: 2, desc: "Below Expectations", color: "bg-red-100 text-red-800" },
  BE2: { pts: 1, desc: "Below Expectations", color: "bg-red-50 text-red-700" },
};

type Result = { id: string; subject: string; rubricLevel: string; term: string; year: number };

export default function PortalReportPage() {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) {
      router.push("/portal/login");
      return;
    }

    fetch("/api/parent/student", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/portal/login");
          return;
        }
        setResults(data.results || []);
        setStudentName(data.name || "");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading report card...</p>
      </div>
    );
  }

  const totalPoints = results.reduce((sum, r) => sum + (RUBRIC_INFO[r.rubricLevel]?.pts || 0), 0);
  const avgPoints = (totalPoints / results.length).toFixed(1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Report Card</h1>
        <p className="text-slate-600 mt-1">{studentName}&apos;s CBC assessment results</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Average Score</span>
          <span className="text-2xl font-bold text-blue-700">{avgPoints} / 8</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {results.map((r) => {
            const info = RUBRIC_INFO[r.rubricLevel];
            return (
              <div key={r.id} className="flex items-center justify-between p-4">
                <span className="font-medium text-slate-900">{r.subject}</span>
                <div className="flex items-center gap-3">
                  <Badge className={info?.color || "bg-slate-100 text-slate-700"}>{r.rubricLevel}</Badge>
                  <span className="text-xs text-slate-500">{info?.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
