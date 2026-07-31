"use client";

import { useState, useEffect } from "react";

interface Paper {
  id: string;
  title: string;
  grade: string;
  subject: string;
  term: string;
  assessmentType: string;
  year: number;
  downloadCount: number;
}

interface PaperContent {
  title: string;
  grade: string;
  subject: string;
  term: string;
  assessmentType: string;
  totalMarks: number;
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

interface Filters {
  grades: string[];
  subjects: string[];
  terms: string[];
  assessmentTypes: string[];
}

export default function RevisionPapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [filters, setFilters] = useState<Filters>({ grades: [], subjects: [], terms: [], assessmentTypes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [viewingPaper, setViewingPaper] = useState<PaperContent | null>(null);
  const [viewingTitle, setViewingTitle] = useState("");
  const [loadingPaper, setLoadingPaper] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, [selectedGrade, selectedSubject, selectedTerm, selectedAssessment]);

  async function fetchPapers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedGrade) params.set("grade", selectedGrade);
    if (selectedSubject) params.set("subject", selectedSubject);
    if (selectedTerm) params.set("term", selectedTerm);
    if (selectedAssessment) params.set("assessmentType", selectedAssessment);

    const res = await fetch(`/api/revision-papers?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPapers(data.papers);
      if (data.filters) setFilters(data.filters);
    }
    setLoading(false);
  }

  async function viewPaper(paper: Paper) {
    setLoadingPaper(true);
    setViewingTitle(paper.title);
    try {
      const res = await fetch(`/api/revision-papers/${paper.id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingPaper(data.paper.content);
      }
    } catch {}
    setLoadingPaper(false);
  }

  function downloadPaper() {
    if (!viewingPaper) return;
    let text = `${viewingPaper.title}\n`;
    text += `Grade: ${viewingPaper.grade} | Subject: ${viewingPaper.subject}\n`;
    text += `Term: ${viewingPaper.term} | Type: ${viewingPaper.assessmentType}\n`;
    text += `Total Marks: ${viewingPaper.totalMarks}\n`;
    text += `${"=".repeat(50)}\n\n`;

    for (const section of viewingPaper.sections) {
      text += `${section.name} (${section.marks} marks)\n`;
      text += `${"-".repeat(40)}\n`;
      for (const q of section.questions) {
        text += `\n${q.number}. (${q.marks} mark${q.marks > 1 ? "s" : ""}) ${q.question}\n`;
        if (q.options) {
          for (const opt of q.options) {
            text += `   ${opt}\n`;
          }
        }
      }
      text += `\n`;
    }

    text += `${"=".repeat(50)}\n`;
    text += `ANSWER KEY\n`;
    text += `${"=".repeat(50)}\n\n`;

    for (const section of viewingPaper.sections) {
      text += `${section.name}:\n`;
      for (const q of section.questions) {
        text += `  ${q.number}. ${q.answer}\n`;
      }
      text += `\n`;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${viewingPaper.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSelectedGrade("");
    setSelectedSubject("");
    setSelectedTerm("");
    setSelectedAssessment("");
  }

  const GRADE_LABELS: Record<string, string> = {
    "1": "Grade 1 (Lower Primary)",
    "2": "Grade 2 (Lower Primary)",
    "3": "Grade 3 (Lower Primary)",
    "4": "Grade 4 (Upper Primary)",
    "5": "Grade 5 (Upper Primary)",
    "6": "Grade 6 (Upper Primary — KPSEA)",
    "7": "Grade 7 (Junior Secondary)",
    "8": "Grade 8 (Junior Secondary)",
    "9": "Grade 9 (Junior Secondary — National Assessment)",
    "10": "Grade 10 (Senior Secondary)",
    "11": "Grade 11 (Senior Secondary)",
    "12": "Grade 12 (Senior Secondary — KCSE)",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">CBC Revision Papers</h1>
        <p className="text-[var(--text-secondary)] mt-1">Free past papers and revision materials for all grades</p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Filter Papers</h2>
          {(selectedGrade || selectedSubject || selectedTerm || selectedAssessment) && (
            <button onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 font-medium">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Grades</option>
            {filters.grades.map((g) => (
              <option key={g} value={g}>{GRADE_LABELS[g] || `Grade ${g}`}</option>
            ))}
          </select>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Subjects</option>
            {filters.subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Terms</option>
            {filters.terms.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Types</option>
            {filters.assessmentTypes.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Papers list */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--text-tertiary)]">No papers found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => viewPaper(paper)}
              className="w-full text-left bg-[var(--surface)] border border-border rounded-xl p-4 hover:border-[var(--border-strong)] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-medium">
                      Grade {paper.grade}
                    </span>
                    <span className="text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-border">
                      {paper.subject}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mt-2 truncate">{paper.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-[var(--text-tertiary)]">{paper.term}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{paper.assessmentType}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{paper.year}</span>
                    <span className="text-xs text-[var(--success)] font-medium">Free</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Paper Viewer Modal */}
      {(viewingPaper || loadingPaper) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setViewingPaper(null); setViewingTitle(""); }}>
          <div className="bg-[var(--surface)] border border-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] truncate max-w-md">{viewingTitle}</h2>
                {viewingPaper && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Total Marks: {viewingPaper.totalMarks}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {viewingPaper && (
                  <button onClick={downloadPaper} className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </button>
                )}
                <button onClick={() => { setViewingPaper(null); setViewingTitle(""); }} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingPaper ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-[var(--text-tertiary)] mt-3">Loading paper...</p>
                </div>
              ) : viewingPaper?.sections.map((section, si) => (
                <div key={si}>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 pb-2 border-b border-border">
                    {section.name} ({section.marks} marks)
                  </h3>
                  <div className="space-y-4">
                    {section.questions.map((q) => (
                      <div key={q.number} className="bg-[var(--background)] border border-border rounded-lg p-3">
                        <p className="text-sm text-[var(--text-primary)]">
                          <span className="font-semibold">{q.number}.</span> {q.question}
                          <span className="text-[var(--text-tertiary)] ml-1">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
                        </p>
                        {q.options && (
                          <div className="mt-2 space-y-1 ml-4">
                            {q.options.map((opt, oi) => (
                              <p key={oi} className="text-sm text-[var(--text-secondary)]">{opt}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-[var(--success)] mt-2 font-medium">Answer: {q.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
