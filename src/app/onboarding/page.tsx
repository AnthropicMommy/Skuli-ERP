"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [schoolType, setSchoolType] = useState("primary");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [motto, setMotto] = useState("");

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.hasStaffRecord) {
          router.push(data.role === "SUPER_ADMIN" || data.role === "PRINCIPAL" ? "/admin" : "/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolName: name, county, subCounty, schoolType, phone, email, motto }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(data.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } else {
      setError(data.error || "Failed to create school");
    }
    setLoading(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-black/40">Loading...</p>
      </div>
    );
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
          <h1 className="text-xl font-semibold text-black">Create your school</h1>
          <p className="text-sm text-black/40 mt-1">
            You&apos;ll be set up as the school administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/70 mb-1">School Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. St. Jude Academy"
              className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">County</label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Nairobi"
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Sub-County</label>
              <input
                type="text"
                value={subCounty}
                onChange={(e) => setSubCounty(e.target.value)}
                placeholder="e.g. Westlands"
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">School Type</label>
              <select
                value={schoolType}
                onChange={(e) => setSchoolType(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="tvet">TVET</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000 000"
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-1">School Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@school.ac.ke"
              className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-1">Motto</label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="Excellence in Education"
              className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create School"}
          </button>
        </form>

        <p className="text-center text-sm text-black/30 mt-6">
          Already have a school?{" "}
          <Link href="/sign-in" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
