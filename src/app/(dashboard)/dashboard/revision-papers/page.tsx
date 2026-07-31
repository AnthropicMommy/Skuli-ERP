"use client";

import { useState } from "react";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SUBJECTS = [
  "English", "Kiswahili", "Mathematics", "Science & Technology", "Integrated Science",
  "Social Studies", "Religious Education", "Creative Arts", "Physical & Health Education",
  "Agriculture & Nutrition", "Computer Studies", "Home Science", "Pre-Technical Education",
  "Physics", "Chemistry", "Biology", "Geography", "History & Government", "Business Studies",
];
const TERMS = ["Term 1", "Term 2", "Term 3"];
const ASSESSMENT_TYPES = ["Opener", "Mid-Term", "End-Term", "KPSEA", "KJSEA", "KCSE", "Exam Revision Booklet"];

interface GeneratedPaper {
  title: string;
  sections: {
    name: string;
    marks: number;
    questions: {
      number: number;
      question: string;
      options?: string[];
      answer: string;
      marks: number;
    }[];
  }[];
}

export default function RevisionPapersAdmin() {
  const [mode, setMode] = useState<"generate" | "upload">("generate");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState("");
  const [assessmentType, setAssessmentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPaper | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!grade || !subject || !term || !assessmentType) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    setGenerated(null);

    try {
      const res = await fetch("/api/revision-papers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, term, assessmentType }),
      });
      const data = await res.json();
      if (res.ok) {
        setGenerated(data.paper);
      } else {
        setError(data.error || "Generation failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  function downloadPaper() {
    if (!generated) return;
    // Format as text for download
    let text = `${generated.title}\n${"=".repeat(50)}\n\n`;
    generated.sections.forEach((section) => {
      text += `${section.name} (${section.marks} marks)\n${"-".repeat(40)}\n\n`;
      section.questions.forEach((q) => {
        text += `${q.number}. (${q.marks} mark${q.marks > 1 ? "s" : ""}) ${q.question}\n`;
        if (q.options) {
          q.options.forEach((opt) => { text += `   ${opt}\n`; });
        }
        text += `\n`;
      });
      text += `\n`;
    });
    text += `\n${"=".repeat(50)}\nAnswer Key\n${"=".repeat(50)}\n\n`;
    generated.sections.forEach((section) => {
      section.questions.forEach((q) => {
        text += `${q.number}. ${q.answer}\n`;
      });
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generated.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Revision Papers</h1>
        <p className="text-[var(--text-secondary)] mt-1">Generate or upload CBC revision papers</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("generate")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
            mode === "generate" ? "bg-primary text-[#0A0A0A] border-primary" : "bg-[var(--surface)] text-[var(--text-secondary)] border-border hover:bg-[var(--surface-hover)]"
          }`}
        >
          AI Generate
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
            mode === "upload" ? "bg-primary text-[#0A0A0A] border-primary" : "bg-[var(--surface)] text-[var(--text-secondary)] border-border hover:bg-[var(--surface-hover)]"
          }`}
        >
          Upload PDF
        </button>
      </div>

      {mode === "generate" ? (
        <div className="bg-[var(--surface)] border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Generate Paper with AI</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Grade</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                <option value="">Select grade</option>
                {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Term</label>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                <option value="">Select term</option>
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Assessment Type</label>
              <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                <option value="">Select type</option>
                {ASSESSMENT_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-[var(--destructive)] mb-4">{error}</p>}
          <button onClick={handleGenerate} disabled={loading} className="bg-primary text-[#0A0A0A] px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
            {loading ? "Generating..." : "Generate Paper"}
          </button>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Upload PDF</h2>
          <p className="text-sm text-[var(--text-secondary)]">Upload form coming soon. Use AI Generate for now.</p>
        </div>
      )}

      {/* Generated paper preview */}
      {generated && (
        <div className="mt-6 bg-[var(--surface)] border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{generated.title}</h2>
            <button onClick={downloadPaper} className="bg-primary text-[#0A0A0A] px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
              Download
            </button>
          </div>
          {generated.sections.map((section, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{section.name} ({section.marks} marks)</h3>
              <div className="space-y-3">
                {section.questions.map((q) => (
                  <div key={q.number} className="bg-[var(--background)] border border-border rounded-lg p-3">
                    <p className="text-sm text-[var(--text-primary)]">
                      <span className="font-medium">{q.number}.</span> {q.question}
                      <span className="text-[var(--text-tertiary)] ml-2">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
                    </p>
                    {q.options && (
                      <div className="mt-2 grid grid-cols-2 gap-1 ml-4">
                        {q.options.map((opt, j) => (
                          <p key={j} className="text-xs text-[var(--text-secondary)]">{opt}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
