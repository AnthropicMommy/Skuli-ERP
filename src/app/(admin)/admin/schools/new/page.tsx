"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [schoolType, setSchoolType] = useState("primary");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [motto, setMotto] = useState("");

  const [principalName, setPrincipalName] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPhone, setPrincipalPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        county,
        subCounty,
        schoolType,
        phone,
        email,
        motto,
        principalName,
        principalEmail,
        principalPhone,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(`/admin/schools/${data.id}`);
    } else {
      const detail = data.debug ? ` (${data.debug}${data.role ? `, role: ${data.role}` : ""})` : "";
      setError(data.error + detail || "Failed to create school");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-black mb-6">Add School</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* School Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-black mb-4">School Details</h2>
          <div className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="e.g. +254 700 000 000"
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. info@school.ac.ke"
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="e.g. Excellence in Education"
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>
        </div>

        {/* Principal Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-black mb-4">Principal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Full Name *</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                required
                placeholder="e.g. James Mwangi"
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Email *</label>
                <input
                  type="email"
                  value={principalEmail}
                  onChange={(e) => setPrincipalEmail(e.target.value)}
                  required
                  placeholder="e.g. james@school.ac.ke"
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Phone</label>
                <input
                  type="tel"
                  value={principalPhone}
                  onChange={(e) => setPrincipalPhone(e.target.value)}
                  placeholder="e.g. +254 700 000 000"
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create School"}
        </button>
      </form>
    </div>
  );
}
