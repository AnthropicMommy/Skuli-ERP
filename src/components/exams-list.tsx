"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Exam = { id: string; name: string; type: string; term: string; year: number; grade: string; weight: number; _count: { results: number } };
type Student = { id: string; name: string; grade: string; admissionNo: string };

const RUBRIC: Record<string, { label: string; color: string }> = {
  EE1: { label: "Exceeding 1", color: "bg-green-100 text-green-700" },
  EE2: { label: "Exceeding 2", color: "bg-green-50 text-green-600" },
  ME1: { label: "Meeting 1", color: "bg-blue-100 text-blue-700" },
  ME2: { label: "Meeting 2", color: "bg-blue-50 text-blue-600" },
  AE1: { label: "Approaching 1", color: "bg-amber-100 text-amber-700" },
  AE2: { label: "Approaching 2", color: "bg-amber-50 text-amber-600" },
  BE1: { label: "Below 1", color: "bg-red-100 text-red-700" },
  BE2: { label: "Below 2", color: "bg-red-50 text-red-600" },
};

const SUBJECTS = ["Mathematics", "Kiswahili", "English", "Science & Technology", "Hygiene & Nutrition", "Social Studies", "Religious Education", "Creative Arts"];

export function ExamsList({ exams, students, grades, schoolId }: { exams: Exam[]; students: Student[]; grades: string[]; schoolId: string }) {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("CAT");
  const [examTerm, setExamTerm] = useState("TERM_1");
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [examGrade, setExamGrade] = useState("");
  const [examWeight, setExamWeight] = useState(100);
  const [creating, setCreating] = useState(false);

  const filtered = students.filter((s) => !selectedGrade || s.grade === selectedGrade);

  async function createExam(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, name: examName, type: examType, term: examTerm, year: examYear, grade: examGrade, weight: examWeight }),
    });
    if (res.ok) {
      window.location.reload();
    }
    setCreating(false);
  }

  return (
    <div className="space-y-4">
      {/* Existing Exams */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Exams</h3>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition"
          >
            {showCreate ? "Cancel" : "Create Exam"}
          </button>
        </div>

        {showCreate && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={createExam} className="grid grid-cols-2 gap-3">
              <div>
                <Label>Exam Name *</Label>
                <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} required placeholder="e.g. Term 1 CAT 1" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <Label>Grade *</Label>
                <Select value={examGrade} onValueChange={(v) => setExamGrade(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                  <option value="CAT">CAT</option>
                  <option value="MID_TERM">Mid-Term</option>
                  <option value="END_TERM">End-Term</option>
                  <option value="MOCK">Mock</option>
                </select>
              </div>
              <div>
                <Label>Term</Label>
                <select value={examTerm} onChange={(e) => setExamTerm(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                  <option value="TERM_1">Term 1</option>
                  <option value="TERM_2">Term 2</option>
                  <option value="TERM_3">Term 3</option>
                </select>
              </div>
              <div>
                <Label>Year</Label>
                <input type="number" value={examYear} onChange={(e) => setExamYear(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <Label>Weight (%)</Label>
                <input type="number" value={examWeight} onChange={(e) => setExamWeight(parseInt(e.target.value))} min={1} max={100} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <button type="submit" disabled={creating || !examName || !examGrade} className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
                  {creating ? "Creating..." : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {exams.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No exams configured yet. Click &quot;Create Exam&quot; above.</div>
          ) : (
            exams.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-sm text-gray-500">{e.grade} · {e.term.replace("_", " ")} {e.year} · Weight: {e.weight}%</p>
                </div>
                <Badge>{e._count.results} results</Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CBC Rubric Entry */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold mb-4">CBC Rubric Entry (8-Point Scale)</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Grade</Label>
            <Select value={selectedGrade} onValueChange={(v) => setSelectedGrade(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
              <SelectContent>{grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Subject</Label>
            <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {selectedGrade && selectedSubject && (
          <div className="divide-y divide-gray-100">
            {filtered.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400 w-20">{student.admissionNo}</span>
                  <span className="font-medium text-sm">{student.name}</span>
                </div>
                <div className="flex gap-1">
                  {Object.entries(RUBRIC).map(([level, { label, color }]) => (
                    <button
                      key={level}
                      onClick={() => setMarks({ ...marks, [`${student.id}-${selectedSubject}`]: level })}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        marks[`${student.id}-${selectedSubject}`] === level
                          ? `${color} ring-1 ring-offset-1 ring-current`
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      title={label}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
