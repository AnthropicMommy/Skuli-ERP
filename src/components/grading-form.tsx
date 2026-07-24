"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SUBJECTS = [
  "Mathematics",
  "Kiswahili",
  "English",
  "Science & Technology",
  "Hygiene & Nutrition",
  "Social Studies",
  "Religious Education",
  "Creative Arts",
  "Physical Education",
];

const RUBRIC_LEVELS = [
  { value: "EE1", label: "Exceeding Expectations", color: "bg-green-100 text-green-700" },
  { value: "EE2", label: "Exceeding Expectations", color: "bg-green-50 text-green-700" },
  { value: "ME1", label: "Meeting Expectations", color: "bg-blue-100 text-blue-700" },
  { value: "ME2", label: "Meeting Expectations", color: "bg-blue-50 text-blue-700" },
  { value: "AE1", label: "Approaching Expectations", color: "bg-amber-100 text-amber-700" },
  { value: "AE2", label: "Approaching Expectations", color: "bg-amber-50 text-amber-700" },
  { value: "BE1", label: "Below Expectations", color: "bg-red-100 text-red-700" },
  { value: "BE2", label: "Below Expectations", color: "bg-red-50 text-red-700" },
];

const TERMS = [
  { value: "TERM_1", label: "Term 1" },
  { value: "TERM_2", label: "Term 2" },
  { value: "TERM_3", label: "Term 3" },
];

type Student = {
  id: string;
  admissionNo: string;
  name: string;
  grade: string;
};

export function GradingForm({
  students,
  grades,
}: {
  students: Student[];
  grades: string[];
}) {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("TERM_1");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const year = new Date().getFullYear();
  const filteredStudents = students.filter(
    (s) => !selectedGrade || s.grade === selectedGrade
  );

  async function saveMarks() {
    setSaving(true);
    const results = filteredStudents.map((student) =>
      fetch("/api/cbc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          subject: selectedSubject,
          term: selectedTerm,
          year,
          rubricLevel: marks[student.id] || "ME1",
        }),
      })
    );

    await Promise.all(results);
    setSaving(false);
    alert("Marks saved successfully!");
  }

  const canSave = selectedGrade && selectedSubject && selectedTerm;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Grade / Class
            </label>
            <Select value={selectedGrade} onValueChange={(v) => setSelectedGrade(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Subject
            </label>
            <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Term
            </label>
            <Select value={selectedTerm} onValueChange={(v) => setSelectedTerm(v ?? "TERM_1")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedGrade && selectedSubject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold">
              {selectedGrade} - {selectedSubject} ({year})
            </h3>
            <Button onClick={saveMarks} disabled={saving || !canSave}>
              {saving ? "Saving..." : "Save All Marks"}
            </Button>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-gray-500 w-24">
                    {student.admissionNo}
                  </span>
                  <span className="font-medium">{student.name}</span>
                </div>

                <div className="flex gap-2">
                  {RUBRIC_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() =>
                        setMarks({ ...marks, [student.id]: level.value })
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        marks[student.id] === level.value
                          ? `${level.color} ring-2 ring-offset-1 ring-current`
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {level.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
