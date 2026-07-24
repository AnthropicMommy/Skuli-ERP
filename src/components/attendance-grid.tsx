"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Student = {
  id: string;
  admissionNo: string;
  name: string;
  grade: string;
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-700",
  EXCUSED: "bg-blue-100 text-blue-700",
};

export function AttendanceGrid({ students, grades }: { students: Student[]; grades: string[] }) {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const filtered = students.filter((s) => !selectedGrade || s.grade === selectedGrade);

  function setStatus(studentId: string, status: string) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAttendance() {
    setSaving(true);
    const results = filtered.map((s) =>
      fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: s.id, date: today, status: statuses[s.id] || "PRESENT" }),
      })
    );
    await Promise.all(results);
    setSaving(false);
    alert("Attendance saved!");
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Grade</label>
          <Select value={selectedGrade} onValueChange={(v) => setSelectedGrade(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="All grades" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grades</SelectItem>
              {grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          {today} · {filtered.length} students
        </div>
        <Button onClick={saveAttendance} disabled={saving}>{saving ? "Saving..." : "Save Attendance"}</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.map((student) => (
          <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-400 w-20">{student.admissionNo}</span>
              <span className="font-medium text-sm">{student.name}</span>
              <span className="text-xs text-gray-400">{student.grade}</span>
            </div>
            <div className="flex gap-1">
              {["PRESENT", "LATE", "ABSENT", "EXCUSED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatus(student.id, status)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    (statuses[student.id] || "PRESENT") === status
                      ? `${STATUS_COLORS[status]} ring-1 ring-offset-1 ring-current`
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
