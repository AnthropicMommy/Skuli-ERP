"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ParentSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/parent/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName, phone }),
    });

    if (res.ok) {
      const data = await res.json();
      document.cookie = `skuli_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      router.push("/portal");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
    setLoading(false);
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
          <h1 className="text-xl font-semibold text-black">Parent sign up</h1>
          <p className="text-sm text-black/40 mt-1">Create an account to track your child&apos;s progress.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1.5">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1.5">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-1.5">Phone (optional)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/80 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-black/30 mt-6">
          Already have an account? <Link href="/portal/login" className="text-black font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
