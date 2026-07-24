"use client";

import { useState } from "react";

export function InvitePrincipalForm({
  schoolId,
  principalName,
  principalEmail,
}: {
  schoolId: string;
  principalName: string;
  principalEmail: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: string; error?: string }>({});

  async function handleInvite() {
    setLoading(true);
    setResult({});

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId,
        name: principalName,
        email: principalEmail,
        role: "PRINCIPAL",
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult({ success: `Invited! Temp password: ${data.tempPassword}` });
    } else {
      setResult({ error: data.error || "Failed to invite" });
    }
    setLoading(false);
  }

  return (
    <div>
      {result.error && (
        <p className="text-xs text-red-600 mb-2">{result.error}</p>
      )}
      {result.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-2">
          <p className="text-xs text-emerald-700 font-medium">{result.success}</p>
          <p className="text-xs text-emerald-600 mt-1">Share this password with the principal. They&apos;ll use it to sign in.</p>
        </div>
      )}
      <button
        onClick={handleInvite}
        disabled={loading || !principalEmail}
        className="text-xs font-medium text-cyan-600 hover:text-cyan-700 disabled:opacity-30"
      >
        {loading ? "Inviting..." : "Invite via Clerk"}
      </button>
    </div>
  );
}
