"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StudentSignupForm from "@/components/student-signup-form";

export default function StudentLoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"school" | "credentials">("school");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function searchSchools(query: string) {
    setSchoolQuery(query);
    if (query.length < 2) { setSchools([]); return; }
    const res = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
    if (res.ok) setSchools(await res.json());
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId: selectedSchool?.id, admissionNo, password }),
    });
    if (res.ok) {
      const data = await res.json();
      document.cookie = `skuli_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push("/student");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
    }
    setLoading(false);
  }

  if (mode === "signup") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
              <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Skuli</span>
            </Link>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Student sign up</h1>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">Create your account to access your class.</p>
          </div>
          <StudentSignupForm />
          <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
            Already have an account? <button onClick={() => setMode("login")} className="text-[var(--text-primary)] font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Skuli</span>
          </Link>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Student sign in</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Access your class materials and assignments.</p>
        </div>

        <div className="space-y-4">
          {step === "school" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">School</label>
                <input type="text" value={schoolQuery} onChange={(e) => searchSchools(e.target.value)} placeholder="Search for your school..." className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>
              {schools.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
                  {schools.map((school) => (
                    <button key={school.id} onClick={() => { setSelectedSchool(school); setStep("credentials"); }} className="w-full text-left px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{school.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--surface)] border border-border px-3 py-2.5 rounded-lg">
                {selectedSchool?.name}
                <button type="button" onClick={() => setStep("school")} className="text-[var(--text-primary)] font-medium hover:underline ml-auto text-xs">Change</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Student ID</label>
                <input type="text" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} placeholder="e.g. SJ/2024/001" required className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
              </div>
              {error && <p className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-3 py-2 rounded-lg border border-[var(--destructive)]/20">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center space-y-3">
          <Link href="/student-sign-in" className="w-full inline-flex items-center justify-center gap-2 bg-[var(--surface)] border border-border text-[var(--text-primary)] text-sm font-medium px-4 py-3 rounded-lg hover:bg-[var(--surface-hover)] transition-all hover:scale-[0.98] active:scale-[0.97]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Sign in with Google
          </Link>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--background)] px-2 text-[var(--text-tertiary)]">or</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">Don&apos;t have an account?</p>
          <button onClick={() => setMode("signup")} className="w-full bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-lg hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97]">
            Sign up with Student ID
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--background)] px-2 text-[var(--text-tertiary)]">or</span>
            </div>
          </div>
          <Link href="/student-login/independent" className="w-full inline-flex items-center justify-center bg-[var(--surface)] border border-border text-[var(--text-primary)] text-sm font-medium px-4 py-3 rounded-lg hover:bg-[var(--surface-hover)] transition-all hover:scale-[0.98] active:scale-[0.97]">
            Study Independently
          </Link>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link href="/portal/login" className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all">Parent Portal</Link>
            <Link href="/login" className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all">Staff Portal</Link>
          </div>
          <Link href="/" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] block mt-4 transition-colors">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
