"use client";

import { useState, useEffect } from "react";

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  staffId: string | null;
  role: string;
  clerkUserId: string | null;
  createdAt: string;
}

const ROLES = [
  "PRINCIPAL",
  "DEPUTY_ACADEMICS",
  "DEPUTY_ADMIN",
  "BURSAR",
  "ACCOUNTANT",
  "HOD",
  "SENIOR_TEACHER",
  "CLASS_TEACHER",
  "TEACHER",
  "NURSE",
  "COUNSELLOR",
  "LIBRARIAN",
  "LAB_TECH",
  "SECRETARY",
  "IT_MANAGER",
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TEACHER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ staffId?: string; error?: string }>({});

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(async (data) => {
        const schoolId = data.school?.id;
        if (schoolId) {
          const res = await fetch(`/api/school/staff?schoolId=${schoolId}`);
          const staffData = await res.json();
          if (Array.isArray(staffData)) setStaff(staffData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteResult({});

    const res = await fetch("/api/staff/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
    });

    const data = await res.json();

    if (res.ok) {
      setInviteResult({ staffId: data.staffId });
      setInviteName("");
      setInviteEmail("");
      setInviteRole("TEACHER");
    } else {
      setInviteResult({ error: data.error });
    }
    setInviteLoading(false);
  }

  async function handleDeactivate(staffId: string) {
    if (!confirm("Are you sure? This will revoke their access.")) return;

    const res = await fetch("/api/staff/deactivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId }),
    });

    if (res.ok) {
      setStaff((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, clerkUserId: null } : s))
      );
    }
  }

  if (loading) {
    return <div className="text-sm text-black/40">Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Staff</h1>
          <p className="text-xs text-black/40 mt-0.5">{staff.length} member{staff.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition"
        >
          {showInvite ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showInvite && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-black mb-4">Add Staff Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  placeholder="e.g. James Mwangi"
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Email *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="james@school.ac.ke"
                  className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Role *</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {inviteResult.error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{inviteResult.error}</p>
            )}
            {inviteResult.staffId && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-700 font-medium">
                  Invite sent! Staff ID: <span className="font-mono">{inviteResult.staffId}</span>
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  They&apos;ll receive an email with their Staff ID and a link to set up their account.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={inviteLoading}
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
            >
              {inviteLoading ? "Sending..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm text-black/40">No staff members yet. Invite your first staff member above.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Staff ID</th>
                <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-black/40 px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-black/40 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-black">{s.name}</p>
                    <p className="text-xs text-black/40">{s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {s.staffId ? (
                      <span className="text-xs font-mono text-black/60 bg-slate-50 px-2 py-1 rounded">
                        {s.staffId}
                      </span>
                    ) : (
                      <span className="text-xs text-black/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-black/60">
                      {s.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.clerkUserId ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-black/30">
                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.clerkUserId && (
                      <button
                        onClick={() => handleDeactivate(s.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
