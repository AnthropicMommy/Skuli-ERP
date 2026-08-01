"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  number: number;
  question: string;
  options: string[] | null;
  answer: string;
  marks: number;
  explanation: string;
}

interface TestResult {
  score: number;
  totalMarks: number;
  percentage: number;
  feedback: string;
  questions: { number: number; correct: boolean; marksEarned: number; marksPossible: number; feedback: string }[];
}

type Phase = "setup" | "generating" | "taking" | "submitting" | "results";

const SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science & Technology",
  "Social Studies", "Creative Arts", "Religious Education",
  "Physical & Health Ed.", "Agriculture & Nutrition", "Computer Science",
  "Home Science", "Pre-Technical Education", "Integrated Science",
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy", desc: "Basic recall and simple concepts" },
  { value: "medium", label: "Medium", desc: "Application and understanding" },
  { value: "hard", label: "Hard", desc: "Analysis and problem-solving" },
];

export default function MwalimuTestPage() {
  const router = useRouter();

  // Setup
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");

  // Phase
  const [phase, setPhase] = useState<Phase>("setup");

  // Test
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState("");

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0 && phase === "taking") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, phase]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && timerActive && phase === "taking" && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function setAnswer(qIndex: number, value: string) {
    setAnswers((prev) => ({ ...prev, [`q-${qIndex}`]: value }));
  }

  async function handleGenerate() {
    if (!subject) return;
    setPhase("generating");
    setError("");

    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];

    try {
      const res = await fetch("/api/mwalimu/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subject, topic, questionCount, difficulty }),
      });

      const data = await res.json();

      if (res.ok) {
        setQuestions(data.questions);
        setTestTitle(data.title);
        setAnswers({});
        // Timer: 2 min per question, min 5 min
        const timerSec = Math.max(5 * 60, data.questions.length * 120);
        setTimeLeft(timerSec);
        setPhase("taking");
        setTimerActive(true);
      } else {
        setError(data.error || "Failed to generate test");
        setPhase("setup");
      }
    } catch {
      setError("Network error. Check your connection.");
      setPhase("setup");
    }
  }

  async function handleSubmit() {
    if (phase === "submitting" || phase === "results") return;
    setPhase("submitting");
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];

    try {
      const res = await fetch("/api/mwalimu/test", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ questions, studentAnswers: answers, subject, grade: questions[0]?.number ? undefined : undefined }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setPhase("results");
      } else {
        // Fallback: simple scoring
        let score = 0;
        let total = 0;
        const qResults: TestResult["questions"] = [];
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const studentAns = (answers[`q-${i}`] || "").trim().toLowerCase();
          const correctAns = q.answer.trim().toLowerCase();
          const correct = studentAns === correctAns || studentAns === correctAns.replace(/^[a-d]\.\s*/, "");
          if (correct) score += q.marks;
          total += q.marks;
          qResults.push({
            number: q.number,
            correct,
            marksEarned: correct ? q.marks : 0,
            marksPossible: q.marks,
            feedback: correct ? "Correct!" : `Correct answer: ${q.answer}`,
          });
        }
        setResult({
          score,
          totalMarks: total,
          percentage: Math.round((score / total) * 100),
          feedback: "Auto-graded (AI unavailable).",
          questions: qResults,
        });
        setPhase("results");
      }
    } catch {
      // Fallback scoring
      let score = 0;
      let total = 0;
      const qResults: TestResult["questions"] = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const studentAns = (answers[`q-${i}`] || "").trim().toLowerCase();
        const correctAns = q.answer.trim().toLowerCase();
        const correct = studentAns === correctAns || studentAns === correctAns.replace(/^[a-d]\.\s*/, "");
        if (correct) score += q.marks;
        total += q.marks;
        qResults.push({
          number: q.number,
          correct,
          marksEarned: correct ? q.marks : 0,
          marksPossible: q.marks,
          feedback: correct ? "Correct!" : `Correct answer: ${q.answer}`,
        });
      }
      setResult({
        score,
        totalMarks: total,
        percentage: Math.round((score / total) * 100),
        feedback: "Auto-graded (offline).",
        questions: qResults,
      });
      setPhase("results");
    }
  }

  async function handleReviseWithMwalimu() {
    if (!result) return;

    // Save revision to DB so Mwalimu can load full context
    let revisionId = "";
    try {
      const token = document.cookie.match(/skuli_token=([^;]+)/)?.[1];
      const gradingData = questions.map((q, i) => {
        const qResult = result.questions.find((r) => r.number === q.number);
        return {
          number: q.number,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          marks: q.marks,
          studentAnswer: answers[`q-${i}`] || "",
          correct: qResult?.correct || false,
          marksEarned: qResult?.marksEarned || 0,
        };
      });

      const res = await fetch("/api/test-revision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject,
          grade: questions[0] ? undefined : undefined,
          title: testTitle,
          totalMarks: result.totalMarks,
          score: result.score,
          percentage: result.percentage,
          questions: gradingData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        revisionId = data.revisionId;
      }
    } catch {}

    // Pass revisionId to Mwalimu via sessionStorage
    try {
      sessionStorage.setItem("mwalimu_revisionId", revisionId);
      sessionStorage.setItem("mwalimu_prefill", `Let's revise my ${subject} test. I scored ${result.score}/${result.totalMarks} (${result.percentage}%). Walk me through the questions I got wrong step by step.`);
    } catch {}
    router.push("/student/mwalimu");
  }

  function handleNewTest() {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setError("");
    setTestTitle("");
  }

  const answeredCount = Object.values(answers).filter((a) => a.trim() !== "").length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* ─── SETUP ─── */}
      {phase === "setup" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Generate a Test</h1>
            <p className="text-[var(--text-secondary)] mt-1">Mwalimu AI creates a custom test based on your subject and topic</p>
          </div>

          {error && (
            <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-2.5 rounded-lg border border-[var(--destructive)]/20">{error}</p>
          )}

          {/* Subject */}
          <div className="bg-[var(--surface)] border border-border rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Subject</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`text-xs px-3 py-2.5 rounded-lg border font-medium transition-all text-left ${
                      subject === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fractions, Photosynthesis, Past Tense..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Leave blank to cover broad topics</p>
            </div>

            {/* Question count + difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors"
                >
                  {[5, 10, 15, 20, 25, 30].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Difficulty</label>
                <div className="space-y-1.5">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        difficulty === d.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-[var(--background)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <span>{d.label}</span>
                      <span className="text-[var(--text-tertiary)] ml-1.5 font-normal">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!subject}
            className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
          >
            Generate Test
          </button>
        </div>
      )}

      {/* ─── GENERATING ─── */}
      {phase === "generating" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Mwalimu is writing your test...</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Creating {questionCount} {difficulty} questions on {subject}</p>
        </div>
      )}

      {/* ─── TAKING ─── */}
      {(phase === "taking" || phase === "submitting") && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-[var(--surface)] border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs">{testTitle}</h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {answeredCount}/{questions.length} answered
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? "text-red-400" : timeLeft < 300 ? "text-yellow-400" : "text-primary"}`}>
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmit}
                disabled={phase === "submitting"}
                className="bg-[var(--success)] text-white px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {phase === "submitting" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Grading...
                  </span>
                ) : (
                  "Submit Test"
                )}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[var(--surface)] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, i) => {
              const key = `q-${i}`;
              const studentAns = answers[key] || "";
              const qResult = result?.questions.find((r) => r.number === q.number);

              return (
                <div key={i} className="bg-[var(--surface)] border border-border rounded-xl p-4">
                  <p className="text-sm text-[var(--text-primary)] mb-3">
                    <span className="font-semibold">{q.number}.</span> {q.question}
                    <span className="text-[var(--text-tertiary)] ml-1">({q.marks}m)</span>
                  </p>

                  {q.options ? (
                    <div className="space-y-1.5 ml-4">
                      {q.options.map((opt, oi) => {
                        let optStyle = "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
                        if (qResult) {
                          if (opt === q.answer) optStyle = "text-[var(--success)] font-medium";
                          else if (opt === studentAns && !qResult.correct) optStyle = "text-red-400 font-medium";
                        } else if (studentAns === opt) {
                          optStyle = "text-primary font-medium";
                        }

                        return (
                          <label key={oi} className={`flex items-center gap-2.5 text-sm cursor-pointer transition-colors ${optStyle}`}>
                            <input
                              type="radio"
                              name={key}
                              value={opt}
                              checked={studentAns === opt}
                              onChange={() => setAnswer(i, opt)}
                              disabled={phase === "submitting"}
                              className="accent-primary"
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={studentAns}
                      onChange={(e) => setAnswer(i, e.target.value)}
                      placeholder="Type your answer..."
                      disabled={phase === "submitting"}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-primary focus:outline-none transition-colors disabled:opacity-60"
                    />
                  )}

                  {/* Show feedback after grading */}
                  {qResult && (
                    <div className={`mt-3 p-2.5 rounded-lg text-xs ${qResult.correct ? "bg-[var(--success)]/10 border border-[var(--success)]/20" : "bg-red-500/10 border border-red-500/20"}`}>
                      <p className={qResult.correct ? "text-[var(--success)]" : "text-red-400"}>
                        {qResult.correct ? "Correct!" : `Your answer: ${studentAns || "(no answer)"}`}
                      </p>
                      {!qResult.correct && (
                        <p className="text-[var(--text-secondary)] mt-1">Correct answer: {q.answer}</p>
                      )}
                      {qResult.feedback && (
                        <p className="text-[var(--text-tertiary)] mt-1">{qResult.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── RESULTS ─── */}
      {phase === "results" && result && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Test Results</h1>
            <p className="text-[var(--text-secondary)] mt-1">{testTitle}</p>
          </div>

          {/* Score card */}
          <div className={`rounded-xl p-6 text-center ${
            result.percentage >= 70 ? "bg-[var(--success)]/10 border border-[var(--success)]/20" :
            result.percentage >= 40 ? "bg-yellow-500/10 border border-yellow-500/20" :
            "bg-red-500/10 border border-red-500/20"
          }`}>
            <p className="text-4xl font-bold text-[var(--text-primary)]">{result.score}/{result.totalMarks}</p>
            <p className="text-lg font-medium text-[var(--text-secondary)] mt-1">{result.percentage}%</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              {result.percentage >= 70 ? "Excellent work!" :
               result.percentage >= 40 ? "Good effort — keep practicing!" :
               "Don't worry, let's review together."}
            </p>
            {result.feedback && (
              <p className="text-xs text-[var(--text-tertiary)] mt-3 max-w-md mx-auto">{result.feedback}</p>
            )}
          </div>

          {/* Question breakdown */}
          <div className="bg-[var(--surface)] border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Question Breakdown</h3>
            <div className="space-y-2">
              {questions.map((q, i) => {
                const qResult = result.questions.find((r) => r.number === q.number);
                const studentAns = answers[`q-${i}`] || "(no answer)";
                return (
                  <div key={i} className={`p-3 rounded-lg border ${qResult?.correct ? "border-[var(--success)]/20 bg-[var(--success)]/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-bold mt-0.5 ${qResult?.correct ? "text-[var(--success)]" : "text-red-400"}`}>
                        {qResult?.correct ? "✓" : "✗"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)]">
                          <span className="font-medium">{q.number}.</span> {q.question}
                        </p>
                        <div className="mt-1 text-xs space-y-0.5">
                          <p className="text-[var(--text-secondary)]">Your answer: <span className={qResult?.correct ? "text-[var(--success)]" : "text-red-400"}>{studentAns}</span></p>
                          {!qResult?.correct && (
                            <p className="text-[var(--text-secondary)]">Correct: <span className="text-[var(--success)]">{q.answer}</span></p>
                          )}
                          {q.explanation && (
                            <p className="text-[var(--text-tertiary)] mt-1 italic">{q.explanation}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                        {qResult?.marksEarned}/{qResult?.marksPossible}m
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {result.percentage < 100 && (
              <button
                onClick={handleReviseWithMwalimu}
                className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97]"
              >
                Revise with Mwalimu
              </button>
            )}
            <button
              onClick={handleNewTest}
              className="flex-1 border border-border text-[var(--text-primary)] px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--surface-hover)] transition-all"
            >
              Take Another Test
            </button>
          </div>

          {result.percentage === 100 && (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--text-secondary)]">Perfect score! You&apos;re ready for the next challenge.</p>
              <Link href="/student/mwalimu" className="text-sm text-primary hover:underline mt-2 inline-block">
                Chat with Mwalimu for more practice →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
