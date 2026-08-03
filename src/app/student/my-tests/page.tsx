"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TestRevision {
  id: string;
  subject: string;
  grade: string;
  title: string;
  totalMarks: number;
  score: number;
  percentage: number;
  createdAt: string;
}

interface Question {
  section: string;
  number: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  studentAnswer: string;
}

export default function MyTestsPage() {
  const [tests, setTests] = useState<TestRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<TestRevision | null>(null);
  const [testDetail, setTestDetail] = useState<Question[] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explaining, setExplaining] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTests();
  }, []);

  async function fetchTests() {
    try {
      const token = document.cookie.match(/skuli_token=([^;]+)/)?.[1];
      if (!token) return;
      const res = await fetch("/api/test-revision", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTests(data.revisions || []);
      }
    } catch {}
    setLoading(false);
  }

  async function viewTest(test: TestRevision) {
    setSelectedTest(test);
    setTestDetail(null);
    setLoadingDetail(true);
    setRevealedAnswers(new Set());
    setExplanations({});
    try {
      const token = document.cookie.match(/skuli_token=([^;]+)/)?.[1];
      const res = await fetch(`/api/test-revision?id=${test.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const questions = data.revision?.questions;
        if (Array.isArray(questions)) {
          setTestDetail(questions);
        }
      }
    } catch {}
    setLoadingDetail(false);
  }

  function toggleReveal(key: string) {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function getExplanation(key: string, q: Question) {
    if (explanations[key] || explaining[key]) return;
    setExplaining((prev) => ({ ...prev, [key]: true }));
    try {
      const token = document.cookie.match(/skuli_token=([^;]+)/)?.[1];
      const res = await fetch("/api/test-revision/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: q.question,
          studentAnswer: q.studentAnswer,
          correctAnswer: q.correctAnswer,
          subject: selectedTest?.subject,
          grade: selectedTest?.grade,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setExplanations((prev) => ({ ...prev, [key]: data.explanation }));
      }
    } catch {}
    setExplaining((prev) => ({ ...prev, [key]: false }));
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Tests</h1>
        <p className="text-[var(--text-secondary)] mt-1">Review your past tests and learn from mistakes</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">No tests yet</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-4">Take a test with Mwalimu to see your results here</p>
          <Link href="/student/mwalimu/test" className="text-xs text-primary font-medium hover:underline">Generate a test</Link>
        </div>
      ) : !selectedTest ? (
        <div className="space-y-3">
          {tests.map((test) => {
            const color = test.percentage >= 70 ? "var(--success)" : test.percentage >= 40 ? "yellow-400" : "red-400";
            return (
              <button key={test.id} onClick={() => viewTest(test)} className="w-full text-left bg-[var(--surface)] border border-border rounded-xl p-4 hover:border-[var(--border-strong)] transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-medium">Grade {test.grade}</span>
                      <span className="text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-border">{test.subject}</span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mt-2 truncate">{test.title}</h3>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{formatDate(test.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`text-lg font-bold`} style={{ color }}>{test.percentage}%</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{test.score}/{test.totalMarks}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => { setSelectedTest(null); setTestDetail(null); }} className="text-xs text-primary font-medium hover:underline mb-4 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Back to all tests
          </button>

          <div className="bg-[var(--surface)] border border-border rounded-xl p-5 mb-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{selectedTest.title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-[var(--text-tertiary)]">{formatDate(selectedTest.createdAt)}</span>
              <span className={`text-sm font-bold ${selectedTest.percentage >= 70 ? "text-[var(--success)]" : selectedTest.percentage >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                {selectedTest.score}/{selectedTest.totalMarks} ({selectedTest.percentage}%)
              </span>
            </div>
          </div>

          {loadingDetail ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          ) : testDetail ? (
            <div className="space-y-4">
              {testDetail.map((q, i) => {
                const key = `${q.section}-${q.number}-${i}`;
                const isCorrect = q.studentAnswer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
                const revealed = revealedAnswers.has(key);
                return (
                  <div key={key} className={`bg-[var(--background)] border rounded-xl p-4 ${isCorrect ? "border-[var(--success)]/30" : "border-red-500/30"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-[var(--text-primary)] flex-1">
                        <span className="font-semibold">{q.number}.</span> {q.question}
                        <span className="text-[var(--text-tertiary)] ml-1">({q.marks}m)</span>
                      </p>
                      {isCorrect ? (
                        <span className="shrink-0 text-xs bg-[var(--success)]/10 text-[var(--success)] px-2 py-0.5 rounded-full border border-[var(--success)]/20 font-medium">Correct</span>
                      ) : (
                        <span className="shrink-0 text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-medium">Wrong</span>
                      )}
                    </div>

                    {q.options && (
                      <div className="mt-2 ml-4 space-y-1">
                        {q.options.map((opt, oi) => {
                          const isStudentChoice = q.studentAnswer?.trim() === opt.trim();
                          const isCorrectOpt = q.correctAnswer?.trim() === opt.trim();
                          return (
                            <p key={oi} className={`text-xs px-2 py-1 rounded ${isCorrectOpt ? "bg-[var(--success)]/10 text-[var(--success)] font-medium" : isStudentChoice && !isCorrectOpt ? "bg-red-500/10 text-red-400" : "text-[var(--text-secondary)]"}`}>
                              {opt} {isStudentChoice && "← your answer"} {isCorrectOpt && !isStudentChoice && "← correct"}
                            </p>
                          );
                        })}
                      </div>
                    )}

                    {!q.options && (
                      <div className="mt-2 ml-4">
                        <p className="text-xs"><span className="text-[var(--text-tertiary)]">Your answer:</span> <span className={isCorrect ? "text-[var(--success)]" : "text-red-400"}>{q.studentAnswer || "(no answer)"}</span></p>
                      </div>
                    )}

                    {!isCorrect && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => toggleReveal(key)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium bg-[var(--surface)] text-[var(--text-secondary)] border border-border px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition"
                        >
                          {revealed ? (
                            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>Hide answer</>
                          ) : (
                            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Reveal answer</>
                          )}
                        </button>
                        {revealed && (
                          <span className="text-xs text-[var(--success)] font-medium">{q.correctAnswer}</span>
                        )}
                      </div>
                    )}

                    {!isCorrect && (
                      <div className="mt-2">
                        {explanations[key] ? (
                          <p className="text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-border rounded-lg p-3">{explanations[key]}</p>
                        ) : (
                          <button
                            onClick={() => getExplanation(key, q)}
                            disabled={explaining[key]}
                            className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
                          >
                            {explaining[key] ? "Explaining..." : "Why is this the answer?"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No question data available for this test.</p>
          )}
        </div>
      )}
    </div>
  );
}
