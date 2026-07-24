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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
              <span className="text-lg font-semibold tracking-tight">Skuli</span>
            </Link>
            <h1 className="text-xl font-semibold text-black">Student sign up</h1>
            <p className="text-sm text-black/40 mt-1">Create your account to access your class.</p>
          </div>
          <StudentSignupForm />
          <p className="text-center text-sm text-black/30 mt-6">
            Already have an account? <button onClick={() => setMode("login")} className="text-black font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
            <span className="text-lg font-semibold tracking-tight">Skuli</span>
          </Link>
          <h1 className="text-xl font-semibold text-black">Student sign in</h1>
          <p className="text-sm text-black/40 mt-1">Access your class materials and assignments.</p>
        </div>

        <div className="space-y-4">
          {step === "school" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1.5">School</label>
                <input type="text" value={schoolQuery} onChange={(e) => searchSchools(e.target.value)} placeholder="Search for your school..." className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              {schools.length > 0 && (
                <div className="border border-black/5 rounded-lg divide-y divide-black/5 max-h-48 overflow-y-auto">
                  {schools.map((school) => (
                    <button key={school.id} onClick={() => { setSelectedSchool(school); setStep("credentials"); }} className="w-full text-left px-3 py-2.5 hover:bg-black/5 transition-colors">
                      <p className="text-sm font-medium text-black">{school.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-black/60 bg-black/5 px-3 py-2 rounded-lg">
                {selectedSchool?.name}
                <button type="button" onClick={() => setStep("school")} className="text-black font-medium hover:underline ml-auto text-xs">Change</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1.5">Student ID</label>
                <input type="text" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} placeholder="e.g. SJ/2024/001" required className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/80 transition disabled:opacity-50">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-black/30">Don&apos;t have an account?</p>
          <button onClick={() => setMode("signup")} className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black/80 transition">
            Sign up as Student
          </button>
          <div className="flex items-center justify-center gap-4">
            <Link href="/portal/login" className="text-xs text-black/50 hover:text-black/70 font-medium">Parent Portal →</Link>
            <span className="text-black/10">|</span>
            <Link href="/login" className="text-xs text-black/50 hover:text-black/70 font-medium">Staff Portal →</Link>
          </div>
          <Link href="/" className="text-xs text-black/30 hover:text-black/50 block mt-4">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
