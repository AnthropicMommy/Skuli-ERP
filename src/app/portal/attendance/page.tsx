"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type Attendance = { id: string; date: string; status: string };

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  LATE: "bg-amber-100 text-amber-700",
  ABSENT: "bg-red-100 text-red-700",
  EXCUSED: "bg-blue-100 text-blue-700",
};

export default function PortalAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) {
      router.push("/portal/login");
      return;
    }

    fetch("/api/parent/attendance", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/portal/login");
          return;
        }
        setRecords(data.attendance || []);
        setStudentName(data.name || "");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading attendance...</p>
      </div>
    );
  }

  const presentDays = records.filter((r) => r.status === "PRESENT").length;
  const totalDays = records.length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-slate-600 mt-1">{studentName}&apos;s attendance record</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-slate-500">Attendance Rate</p>
            <p className="text-3xl font-bold text-slate-900">{attendanceRate}%</p>
          </div>
          <div className="flex-1">
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${attendanceRate}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{presentDays} of {totalDays} days present</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4">
              <span className="text-sm text-slate-900">
                {new Date(r.date).toLocaleDateString("en-KE", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
              </span>
              <Badge className={STATUS_COLORS[r.status] || "bg-slate-100 text-slate-700"}>{r.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
