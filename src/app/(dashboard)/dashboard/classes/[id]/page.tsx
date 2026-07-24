"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface ClassDetail {
  id: string;
  name: string;
  grade: number;
  classTeacher: { id: string; name: string; role: string; staffId: string } | null;
  coTeachers: { id: string; name: string; role: string; staffId: string }[];
  students: { id: string; name: string; admissionNo: string; grade: string; gender: string }[];
  _count: { students: number; enrollments: number };
}

interface Enrollment {
  id: string;
  status: string;
  student: { id: string; name: string; admissionNo: string };
  createdAt: string;
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"students" | "pending" | "chat">("students");

  useEffect(() => {
    Promise.all([
      fetch(`/api/classes/${params.id}`).then((r) => r.json()),
    ]).then(([classData]) => {
      setCls(classData);
      setLoading(false);
    });
  }, [params.id]);

  async function handleApprove(enrollmentId: string) {
    await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    if (cls) {
      const updated = await fetch(`/api/classes/${params.id}`).then((r) => r.json());
      setCls(updated);
    }
  }

  async function handleReject(enrollmentId: string) {
    await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
  }

  if (loading) return <div className="text-sm text-black/40">Loading...</div>;
  if (!cls) return <div className="text-sm text-black/40">Class not found.</div>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-black/40 hover:text-black/60 mb-4">&larr; Back to classes</button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">{cls.name}</h1>
          <p className="text-xs text-black/40 mt-0.5">
            {cls._count.students} student{cls._count.students !== 1 ? "s" : ""}
            {cls.classTeacher && ` · Teacher: ${cls.classTeacher.name}`}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {(["students", "pending", "chat"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/60"}`}>
            {t === "students" ? "Students" : t === "pending" ? "Pending Requests" : "Class Chat"}
          </button>
        ))}
      </div>

      {tab === "students" && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {cls.students.length === 0 ? (
            <p className="text-sm text-black/40 p-6 text-center">No students in this class yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Admission No</th>
                  <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Gender</th>
                </tr>
              </thead>
              <tbody>
                {cls.students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-black">{s.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-black/60">{s.admissionNo}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{s.gender || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "pending" && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {enrollments.length === 0 ? (
            <p className="text-sm text-black/40 p-6 text-center">No pending requests.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-black">{e.student.name}</p>
                    <p className="text-xs text-black/40">{e.student.admissionNo}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(e.id)} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100">Approve</button>
                    <button onClick={() => handleReject(e.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "chat" && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
          <p className="text-sm text-black/40">Class chat available for students at /student/class/{cls.id}</p>
        </div>
      )}
    </div>
  );
}
