"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const GRADE_LEVELS: Record<string, string> = {
  "1": "Lower Primary", "2": "Lower Primary", "3": "Lower Primary",
  "4": "Upper Primary", "5": "Upper Primary", "6": "Upper Primary (KPSEA)",
  "7": "Junior Secondary", "8": "Junior Secondary", "9": "Junior Secondary",
  "10": "Senior Secondary", "11": "Senior Secondary", "12": "Senior Secondary (KCSE)",
};

const SUBJECTS = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Science & Technology",
  "Social Studies",
  "Creative Arts",
  "Religious Education",
  "Physical & Health Ed.",
  "Agriculture & Nutrition",
  "Computer Science",
  "Home Science",
  "Pre-Technical Education",
  "Integrated Science",
  "Foreign Languages",
];

const CHALLENGES = [
  { id: "concepts", label: "Understanding concepts", desc: "I get lost when teachers explain new topics" },
  { id: "problems", label: "Hard problems & equations", desc: "I can solve easy questions but struggle with harder ones" },
  { id: "exams", label: "Exam preparation", desc: "I study but don't know how to prepare for tests" },
  { id: "resources", label: "Finding study materials", desc: "I can't find good notes, books, or practice questions" },
];

const GOALS = [
  { id: "pass", label: "Pass my exams", desc: "I want to make sure I pass end-of-term exams" },
  { id: "top-marks", label: "Score top marks", desc: "I want to be among the top students in my class" },
  { id: "understand", label: "Understand topics better", desc: "I want to really understand, not just memorize" },
  { id: "explore", label: "Explore new subjects", desc: "I want to learn beyond what's taught in class" },
];

export function OnboardingQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [challenge, setChallenge] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/student-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade, subjects: selectedSubjects, challenge, goal }),
    });
    if (res.ok) {
      router.push("/student");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  }

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-[var(--surface)] rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step 1: Grade */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">What grade are you in?</h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">This helps us find the right content for you.</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    grade === g
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div>Grade {g}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{GRADE_LEVELS[g]}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              disabled={!grade}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Subjects */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Which subjects do you need help with?</h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Pick all that apply.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
                    selectedSubjects.includes(s)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-4 py-3 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={selectedSubjects.length === 0}
                className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Challenge */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">What&apos;s your biggest study challenge?</h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">We&apos;ll tailor your experience around this.</p>
            </div>
            <div className="space-y-3">
              {CHALLENGES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChallenge(c.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    challenge === c.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-[var(--surface)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <p className={`text-sm font-medium ${challenge === c.id ? "text-primary" : "text-[var(--text-primary)]"}`}>{c.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!challenge}
                className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Goal */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">What&apos;s your main goal?</h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">This helps Mwalimu focus on what matters to you.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    goal === g.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-[var(--surface)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <p className={`text-sm font-medium ${goal === g.id ? "text-primary" : "text-[var(--text-primary)]"}`}>{g.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-3 py-2 rounded-lg border border-[var(--destructive)]/20">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!goal || loading}
                className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Setting up..." : "Get Started"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
