"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [joinCode, setJoinCode] = useState("");
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/school/join-code")
      .then((r) => r.json())
      .then((data) => {
        setCurrentCode(data.joinCode);
        setJoinCode(data.joinCode || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/school/join-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode }),
    });

    const data = await res.json();

    if (res.ok) {
      setCurrentCode(data.joinCode);
      setMessage("Join code updated");
    } else {
      setMessage(data.error || "Failed to update");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="text-sm text-black/40">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-black mb-6">School Settings</h1>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-black mb-1">School Join Code</h2>
        <p className="text-xs text-black/40 mb-4">
          This code lets new staff members join your school. Share it verbally or via message — staff use it on the login page to create their account.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/70 mb-1">Join Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. JUDES2024"
              minLength={4}
              className="w-full px-3 py-2.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 font-mono tracking-wide uppercase"
            />
          </div>

          {message && (
            <p className={`text-xs ${message.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>
              {message}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !joinCode || joinCode.length < 4}
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : currentCode ? "Update Code" : "Set Join Code"}
            </button>
            {currentCode && (
              <span className="text-xs text-black/30">
                Current: <span className="font-mono text-black/50">{currentCode}</span>
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mt-4">
        <h2 className="text-sm font-semibold text-black mb-1">How It Works</h2>
        <div className="space-y-2 mt-3">
          <div className="flex items-start gap-2">
            <span className="text-xs text-black/30 mt-0.5">1.</span>
            <p className="text-xs text-black/50">Set a join code above (e.g., <code className="bg-slate-50 px-1 rounded">JUDES2024</code>)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-black/30 mt-0.5">2.</span>
            <p className="text-xs text-black/50">Share the code with new staff when they join</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-black/30 mt-0.5">3.</span>
            <p className="text-xs text-black/50">They enter the code on the login page to create their account</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-black/30 mt-0.5">4.</span>
            <p className="text-xs text-black/50">Or use the <strong>Invite Staff</strong> button on the Staff page to send them an email directly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
