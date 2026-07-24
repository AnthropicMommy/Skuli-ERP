"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface School {
  id: string;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"search" | "login">("search");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  async function searchSchools(q: string) {
    setSchoolQuery(q);
    if (q.length < 2) {
      setSchools([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSchools(data);
    setSearching(false);
  }

  function selectSchool(school: School) {
    setSelectedSchool(school);
    setStep("login");
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: selectedSchool!.id,
        staffId,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok && data.clerkUserId) {
      window.location.href = "/sign-in";
    } else {
      setError(data.error || "Login failed");
      if (data.schoolContact) {
        setError(
          `${data.error} Contact: ${data.schoolContact.phone || "No phone"} / ${data.schoolContact.email || "No email"}`
        );
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
            <span className="text-lg font-semibold tracking-tight">Skuli</span>
          </Link>
          <h1 className="text-xl font-semibold text-black">Sign in to Skuli</h1>
          <p className="text-sm text-black/40 mt-1">School management made simple</p>
        </div>

        {step === "search" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Find your school</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  value={schoolQuery}
                  onChange={(e) => searchSchools(e.target.value)}
                  placeholder="Search by school name..."
                  className="w-full pl-10 pr-4 py-3 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  autoFocus
                />
              </div>
            </div>

            {schools.length > 0 && (
              <div className="border border-black/10 rounded-lg divide-y divide-black/5">
                {schools.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSchool(s)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition text-sm"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {searching && (
              <p className="text-xs text-black/30 text-center">Searching...</p>
            )}

            {schoolQuery.length >= 2 && !searching && schools.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-black/40 mb-2">No schools found</p>
                <p className="text-xs text-black/30">
                  Don&apos;t have an account yet? Contact your school administrator to get started.
                </p>
              </div>
            )}
          </div>
        )}

        {step === "login" && selectedSchool && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => { setStep("search"); setError(""); setStaffId(""); setPassword(""); }}
                className="text-xs text-black/40 hover:text-black/60"
              >
                ← Change school
              </button>
              <span className="text-xs text-black/20">|</span>
              <span className="text-xs text-black/60 font-medium">{selectedSchool.name}</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Staff ID</label>
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. STS-clx1-001"
                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 font-mono tracking-wide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mt-4">
              <p className="text-xs text-black/40 mb-2">Don&apos;t have a Staff ID?</p>
              <p className="text-xs text-black/50">
                Contact the school administration to get your invite code. You&apos;ll receive an email with your Staff ID and a link to set up your account.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-black/30">Not staff?</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/portal/login" className="text-xs text-black/50 hover:text-black/70 font-medium">
              Parent Portal →
            </Link>
            <span className="text-black/10">|</span>
            <Link href="/student-login" className="text-xs text-black/50 hover:text-black/70 font-medium">
              Student Portal →
            </Link>
          </div>
          <Link href="/" className="text-xs text-black/30 hover:text-black/50 block mt-4">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
