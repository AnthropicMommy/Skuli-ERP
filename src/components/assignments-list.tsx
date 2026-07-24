"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  subject: string;
  term: string;
  year: number;
  dueDate: Date | null;
  createdAt: Date;
  _count: { submissions: number };
};

export function AssignmentsList({ assignments, schoolId }: { assignments: Assignment[]; schoolId: string }) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("TERM_1");
  const [year, setYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, title, description, grade, subject, term, year, dueDate: dueDate || null }),
    });
    if (res.ok) window.location.reload();
    setCreating(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition"
        >
          {showCreate ? "Cancel" : "Create Assignment"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">New Assignment</h3>
          <form onSubmit={createAssignment} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Title *</Label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Chapter 5 Homework" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional description..." className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <Label>Grade *</Label>
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} required placeholder="e.g. Grade 5" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <Label>Subject *</Label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Mathematics" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <Label>Term</Label>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="TERM_1">Term 1</option>
                <option value="TERM_2">Term 2</option>
                <option value="TERM_3">Term 3</option>
              </select>
            </div>
            <div>
              <Label>Year</Label>
              <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <Label>Due Date</Label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={creating || !title || !grade || !subject} className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
                {creating ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-3xl block mb-2">📚</span>
            No assignments yet. Click &quot;Create Assignment&quot; above.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignments.map((a) => (
              <div key={a.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{a.title}</h4>
                    {a.description && <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{a.grade}</Badge>
                      <Badge variant="outline">{a.subject}</Badge>
                      <Badge variant="outline">{a.term.replace("_", " ")}</Badge>
                      {a.dueDate && <span className="text-xs text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Badge>{a._count.submissions} submissions</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
