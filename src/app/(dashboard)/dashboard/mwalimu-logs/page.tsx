"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type MwalimuMessage = {
  id: string;
  studentId: string;
  classId: string | null;
  subject: string;
  role: string;
  content: string;
  createdAt: string;
};

type Student = {
  id: string;
  name: string;
  admissionNo: string;
  grade: string;
};

export default function MwalimuLogsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [messages, setMessages] = useState<MwalimuMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/school/staff")
      .then((r) => r.json())
      .then(() => {
        // We need students, not staff — use a different approach
        fetch("/api/classes")
          .then((r) => r.json())
          .then(async (classes) => {
            const allStudents: Student[] = [];
            for (const cls of classes) {
              const res = await fetch(`/api/classes/${cls.id}/students`);
              if (res.ok) {
                const studs = await res.json();
                allStudents.push(...studs.map((s: Student) => ({ ...s, grade: cls.name })));
              }
            }
            setStudents(allStudents);
          });
      });
  }, []);

  useEffect(() => {
    if (!selectedStudent) {
      setMessages([]);
      return;
    }
    setLoading(true);
    fetch(`/api/mwalimu/logs?studentId=${selectedStudent}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      });
  }, [selectedStudent]);

  // Group messages into conversations
  const conversations = messages.reduce((acc, msg) => {
    const key = `${msg.studentId}-${msg.subject}`;
    if (!acc[key]) acc[key] = { subject: msg.subject, messages: [] };
    acc[key].messages.push(msg);
    return acc;
  }, {} as Record<string, { subject: string; messages: MwalimuMessage[] }>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Tutor (Mwalimu) Logs</h1>
        <p className="text-gray-500 mt-1">Review student conversations with the AI tutor for safeguarding</p>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">Select Student</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm px-3 py-2 w-full max-w-md"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.admissionNo}) — {s.grade}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && loading && (
        <div className="text-center py-8 text-gray-500">Loading conversations...</div>
      )}

      {selectedStudent && !loading && messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">No AI tutor conversations found for this student.</div>
      )}

      {Object.entries(conversations).map(([key, conv]) => (
        <div key={key} className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-sm">{conv.subject}</h3>
            <Badge variant="outline">{conv.messages.length} messages</Badge>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {conv.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"
                }`}>
                  <p className="text-[10px] text-gray-400 mb-0.5">
                    {msg.role === "user" ? "Student" : "Mwalimu"} — {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
