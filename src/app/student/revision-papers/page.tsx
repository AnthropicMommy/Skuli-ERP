"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import jsPDF from "jspdf";

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

interface PaperQuestion {
  number: number;
  question: string;
  options?: string[];
  answer: string;
  marks: number;
}

interface PaperSection {
  name: string;
  marks: number;
  questions: PaperQuestion[];
}

interface PaperContent {
  title: string;
  grade: string;
  subject: string;
  term: string;
  assessmentType: string;
  totalMarks: number;
  sections: PaperSection[];
}

interface Filters {
  grades: string[];
  subjects: string[];
  terms: string[];
  assessmentTypes: string[];
}

interface TestAnswer {
  questionKey: string;
  answer: string;
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
  const [viewingPaperId, setViewingPaperId] = useState<string | null>(null);
  const [viewingTitle, setViewingTitle] = useState("");
  const [loadingPaper, setLoadingPaper] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  // Test mode state
  const [testMode, setTestMode] = useState(false);
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState<{ score: number; total: number; feedback: string } | null>(null);
  const [testGrading, setTestGrading] = useState(false);
  const [testTimeLeft, setTestTimeLeft] = useState(0);
  const [testTimerActive, setTestTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchPapers();
  }, [selectedGrade, selectedSubject, selectedTerm, selectedAssessment]);

  useEffect(() => {
    if (testTimerActive && testTimeLeft > 0 && !testSubmitted) {
      timerRef.current = setInterval(() => {
        setTestTimeLeft((prev) => {
          if (prev <= 1) {
            setTestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [testTimerActive, testSubmitted]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (testTimeLeft === 0 && testTimerActive && !testSubmitted && testMode) {
      handleSubmitTest();
    }
  }, [testTimeLeft]);

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
    setViewingPaperId(paper.id);
    setShowAnswers(false);
    setTestMode(false);
    setTestSubmitted(false);
    setTestScore(null);
    setTestAnswers([]);
    setTestTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await fetch(`/api/revision-papers/${paper.id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingPaper(data.paper.content);
      }
    } catch {}
    setLoadingPaper(false);
  }

  function closeViewer() {
    setViewingPaper(null);
    setViewingTitle("");
    setViewingPaperId(null);
    setTestMode(false);
    setTestSubmitted(false);
    setTestScore(null);
    setTestAnswers([]);
    setTestTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // Start interactive test
  function startTest() {
    if (!viewingPaper) return;
    setTestMode(true);
    setTestSubmitted(false);
    setTestScore(null);
    setTestAnswers([]);
    // 1.5 min per mark, min 10 min
    const totalMin = Math.max(10, Math.ceil(viewingPaper.totalMarks * 1.5));
    setTestTimeLeft(totalMin * 60);
    setTestTimerActive(true);
  }

  function setAnswer(questionKey: string, answer: string) {
    setTestAnswers((prev) => {
      const existing = prev.find((a) => a.questionKey === questionKey);
      if (existing) return prev.map((a) => a.questionKey === questionKey ? { ...a, answer } : a);
      return [...prev, { questionKey, answer }];
    });
  }

  async function handleSubmitTest() {
    if (!viewingPaper || testSubmitted) return;
    setTestTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTestGrading(true);

    // Build questions with student answers for AI grading
    const questionsForGrading: { section: string; number: number; question: string; options?: string[]; correctAnswer: string; marks: number; studentAnswer: string }[] = [];
    for (const section of viewingPaper.sections) {
      for (const q of section.questions) {
        const key = `${section.name}-${q.number}`;
        const studentAns = testAnswers.find((a) => a.questionKey === key)?.answer || "";
        questionsForGrading.push({
          section: section.name,
          number: q.number,
          question: q.question,
          options: q.options,
          correctAnswer: q.answer,
          marks: q.marks,
          studentAnswer: studentAns,
        });
      }
    }

    try {
      const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
      const res = await fetch("/api/revision-papers/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          paperTitle: viewingPaper.title,
          totalMarks: viewingPaper.totalMarks,
          questions: questionsForGrading,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestScore(data);
      } else {
        // Fallback: simple scoring
        let score = 0;
        for (const q of questionsForGrading) {
          if (q.studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            score += q.marks;
          }
        }
        setTestScore({
          score,
          total: viewingPaper.totalMarks,
          feedback: "Auto-graded (AI unavailable). Review the answer key for detailed feedback.",
        });
      }
    } catch {
      let score = 0;
      for (const q of questionsForGrading) {
        if (q.studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          score += q.marks;
        }
      }
      setTestScore({
        score,
        total: viewingPaper.totalMarks,
        feedback: "Auto-graded (offline). Review the answer key for detailed feedback.",
      });
    }
    setTestSubmitted(true);
    setTestGrading(false);
  }

  function downloadPDF() {
    if (!viewingPaper) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(viewingPaper.title, pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Grade: ${viewingPaper.grade} | Subject: ${viewingPaper.subject}`, pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text(`Term: ${viewingPaper.term} | Type: ${viewingPaper.assessmentType} | Total Marks: ${viewingPaper.totalMarks}`, pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 8;

    for (const section of viewingPaper.sections) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${section.name} (${section.marks} marks)`, 20, y);
      y += 8;

      for (const q of section.questions) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const qText = `${q.number}. (${q.marks} mark${q.marks > 1 ? "s" : ""}) ${q.question}`;
        const lines = doc.splitTextToSize(qText, pageWidth - 40);
        doc.text(lines, 20, y);
        y += lines.length * 5;

        if (q.options) {
          doc.setFont("helvetica", "normal");
          for (const opt of q.options) {
            if (y > 260) { doc.addPage(); y = 20; }
            const optLines = doc.splitTextToSize(`   ${opt}`, pageWidth - 40);
            doc.text(optLines, 20, y);
            y += optLines.length * 5;
          }
        }
        y += 3;
      }
      y += 5;
    }

    doc.save(`${viewingPaper.title.replace(/[^a-zA-Z0-9]/g, "_")}_questions.pdf`);
  }

  function downloadText(questionsOnly = true) {
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

    if (!questionsOnly) {
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
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${viewingPaper.title.replace(/[^a-zA-Z0-9]/g, "_")}${questionsOnly ? "_questions" : "_with_answers"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSelectedGrade("");
    setSelectedSubject("");
    setSelectedTerm("");
    setSelectedAssessment("");
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const GRADE_LABELS: Record<string, string> = {
    "1": "Grade 1 (Lower Primary)", "2": "Grade 2 (Lower Primary)", "3": "Grade 3 (Lower Primary)",
    "4": "Grade 4 (Upper Primary)", "5": "Grade 5 (Upper Primary)", "6": "Grade 6 (Upper Primary — KPSEA)",
    "7": "Grade 7 (Junior Secondary)", "8": "Grade 8 (Junior Secondary)", "9": "Grade 9 (Junior Secondary — National Assessment)",
    "10": "Grade 10 (Senior Secondary)", "11": "Grade 11 (Senior Secondary)", "12": "Grade 12 (Senior Secondary — KCSE)",
  };

  const allQuestions = viewingPaper?.sections.flatMap((s) => s.questions.map((q) => ({ ...q, sectionName: s.name }))) || [];
  const answeredCount = testAnswers.filter((a) => a.answer.trim() !== "").length;

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
            <button onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 font-medium">Clear all</button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Grades</option>
            {filters.grades.map((g) => <option key={g} value={g}>{GRADE_LABELS[g] || `Grade ${g}`}</option>)}
          </select>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Subjects</option>
            {filters.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Terms</option>
            {filters.terms.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
            <option value="">All Types</option>
            {filters.assessmentTypes.map((a) => <option key={a} value={a}>{a}</option>)}
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
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">No papers found</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-4">Try adjusting your filters or check back later</p>
          {(selectedGrade || selectedSubject || selectedTerm || selectedAssessment) ? (
            <button onClick={clearFilters} className="text-xs text-primary font-medium hover:underline">Clear all filters</button>
          ) : (
            <a href="/student/library" className="text-xs text-primary font-medium hover:underline">Browse the Library instead</a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <button key={paper.id} onClick={() => viewPaper(paper)} className="w-full text-left bg-[var(--surface)] border border-border rounded-xl p-4 hover:border-[var(--border-strong)] transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-medium">Grade {paper.grade}</span>
                    <span className="text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-border">{paper.subject}</span>
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

      {/* Paper Viewer / Test Modal */}
      {(viewingPaper || loadingPaper) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeViewer}>
          <div className="bg-[var(--surface)] border border-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)] truncate max-w-md">{viewingTitle}</h2>
                {viewingPaper && !testMode && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Total Marks: {viewingPaper.totalMarks}</p>
                )}
                {testMode && !testSubmitted && (
                  <p className="text-xs mt-0.5">
                    <span className="text-[var(--text-tertiary)]">{answeredCount}/{allQuestions.length} answered</span>
                    <span className={`ml-2 font-mono font-bold ${testTimeLeft < 60 ? "text-red-400" : "text-primary"}`}>
                      {formatTime(testTimeLeft)}
                    </span>
                  </p>
                )}
                {testSubmitted && testScore && (
                  <p className="text-xs mt-0.5">
                    <span className={`font-bold ${testScore.score >= testScore.total * 0.7 ? "text-[var(--success)]" : testScore.score >= testScore.total * 0.4 ? "text-yellow-400" : "text-red-400"}`}>
                      Score: {testScore.score}/{testScore.total} ({Math.round((testScore.score / testScore.total) * 100)}%)
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {viewingPaper && !testMode && !testSubmitted && (
                  <>
                    <button onClick={downloadPDF} className="inline-flex items-center gap-1.5 text-xs font-medium bg-[var(--surface-hover)] text-[var(--text-primary)] border border-border px-3 py-1.5 rounded-lg hover:bg-[var(--background)] transition" title="Download PDF">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      PDF
                    </button>
                    <button onClick={() => downloadText(true)} className="inline-flex items-center gap-1.5 text-xs font-medium bg-[var(--surface-hover)] text-[var(--text-primary)] border border-border px-3 py-1.5 rounded-lg hover:bg-[var(--background)] transition" title="Download TXT">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                      TXT
                    </button>
                    <button
                      onClick={() => setShowAnswers(!showAnswers)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${showAnswers ? "bg-primary text-primary-foreground border-primary" : "bg-[var(--surface-hover)] text-[var(--text-primary)] border-border hover:bg-[var(--background)]"}`}
                    >
                      {showAnswers ? (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>Hide</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Answers</>
                      )}
                    </button>
                    <button onClick={startTest} className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                      Start Test
                    </button>
                  </>
                )}
                {testMode && !testSubmitted && (
                  <button onClick={handleSubmitTest} disabled={testGrading} className="inline-flex items-center gap-1.5 text-xs font-medium bg-[var(--success)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition disabled:opacity-50">
                    {testGrading ? (
                      <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Grading...</>
                    ) : (
                      <>Submit Test</>
                    )}
                  </button>
                )}
                {testSubmitted && (
                  <button onClick={() => { setTestMode(false); setTestSubmitted(false); setTestScore(null); setShowAnswers(true); }} className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition">
                    Review Answers
                  </button>
                )}
                <button onClick={closeViewer} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingPaper ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-[var(--text-tertiary)] mt-3">Loading paper...</p>
                </div>
              ) : testGrading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-[var(--text-primary)] mt-3 font-medium">Mwalimu is grading your test...</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">This may take a moment</p>
                </div>
              ) : testSubmitted && testScore ? (
                <div className="space-y-4">
                  {/* Score card */}
                  <div className={`rounded-xl p-5 text-center ${testScore.score >= testScore.total * 0.7 ? "bg-[var(--success)]/10 border border-[var(--success)]/20" : testScore.score >= testScore.total * 0.4 ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{testScore.score}/{testScore.total}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{Math.round((testScore.score / testScore.total) * 100)}% — {testScore.score >= testScore.total * 0.7 ? "Well done!" : testScore.score >= testScore.total * 0.4 ? "Keep practicing!" : "Review the material and try again."}</p>
                    {testScore.feedback && <p className="text-xs text-[var(--text-tertiary)] mt-2 max-w-md mx-auto">{testScore.feedback}</p>}
                  </div>

                  {/* Question review */}
                  {viewingPaper?.sections.map((section, si) => (
                    <div key={si}>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 pb-2 border-b border-border">{section.name}</h3>
                      <div className="space-y-3">
                        {section.questions.map((q) => {
                          const key = `${section.name}-${q.number}`;
                          const studentAns = testAnswers.find((a) => a.questionKey === key)?.answer || "";
                          const isCorrect = studentAns.trim().toLowerCase() === q.answer.trim().toLowerCase();
                          return (
                            <div key={q.number} className={`bg-[var(--background)] border rounded-lg p-3 ${isCorrect ? "border-[var(--success)]/30" : "border-red-500/30"}`}>
                              <p className="text-sm text-[var(--text-primary)]">
                                <span className="font-semibold">{q.number}.</span> {q.question}
                                <span className="text-[var(--text-tertiary)] ml-1">({q.marks}m)</span>
                              </p>
                              {q.options && <div className="mt-1.5 space-y-0.5 ml-4">{q.options.map((o, i) => <p key={i} className="text-xs text-[var(--text-secondary)]">{o}</p>)}</div>}
                              <div className="mt-2 flex items-start gap-3">
                                <p className="text-xs"><span className="text-[var(--text-tertiary)]">Your answer:</span> <span className={isCorrect ? "text-[var(--success)] font-medium" : "text-red-400 font-medium"}>{studentAns || "(no answer)"}</span></p>
                                {!isCorrect && <p className="text-xs"><span className="text-[var(--text-tertiary)]">Correct:</span> <span className="text-[var(--success)] font-medium">{q.answer}</span></p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : viewingPaper?.sections.map((section, si) => (
                <div key={si}>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 pb-2 border-b border-border">
                    {section.name} ({section.marks} marks)
                  </h3>
                  <div className="space-y-4">
                    {section.questions.map((q) => {
                      const key = `${section.name}-${q.number}`;
                      const studentAns = testAnswers.find((a) => a.questionKey === key)?.answer || "";
                      return (
                        <div key={q.number} className="bg-[var(--background)] border border-border rounded-lg p-3">
                          <p className="text-sm text-[var(--text-primary)]">
                            <span className="font-semibold">{q.number}.</span> {q.question}
                            <span className="text-[var(--text-tertiary)] ml-1">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
                          </p>
                          {q.options && (
                            <div className="mt-2 space-y-1 ml-4">
                              {q.options.map((opt, oi) => (
                                <label key={oi} className={`flex items-center gap-2 text-sm cursor-pointer ${testMode ? "hover:text-primary transition-colors" : "text-[var(--text-secondary)]"}`}>
                                  {testMode ? (
                                    <input type="radio" name={key} value={opt} checked={studentAns === opt} onChange={() => setAnswer(key, opt)} className="accent-primary" />
                                  ) : null}
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}
                          {testMode && !q.options && (
                            <input
                              type="text"
                              value={studentAns}
                              onChange={(e) => setAnswer(key, e.target.value)}
                              placeholder="Type your answer..."
                              className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-[var(--surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-primary focus:outline-none"
                            />
                          )}
                          {showAnswers && !testMode && (
                            <p className="text-xs text-[var(--success)] mt-2 font-medium">Answer: {q.answer}</p>
                          )}
                        </div>
                      );
                    })}
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
