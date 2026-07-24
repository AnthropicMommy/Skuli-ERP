"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface InviteData {
  schoolName: string;
  staffName: string;
  email: string;
  role: string;
  staffId: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`/api/staff/invite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvite(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load invite");
        setLoading(false);
      });
  }, [token]);

  async function handleAccept() {
    setCreating(true);
    setError("");

    try {
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent(`/invite/${token}/complete`)}`;
    } catch {
      setError("Failed to proceed");
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-black/40">Loading...</p>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-black mb-2">Invalid Invite</h1>
          <p className="text-sm text-black/40 mb-6">{error}</p>
          <Link href="/login" className="text-sm text-black font-medium hover:underline">
            Go to Sign In
          </Link>
        </div>
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
        </div>

        {invite && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-black mb-2">You&apos;re invited!</h1>
              <p className="text-sm text-black/40">
                You&apos;ve been invited to join <strong className="text-black/60">{invite.schoolName}</strong>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 space-y-3">
              <div>
                <p className="text-xs text-black/30 mb-0.5">Name</p>
                <p className="text-sm font-medium text-black">{invite.staffName}</p>
              </div>
              <div>
                <p className="text-xs text-black/30 mb-0.5">Email</p>
                <p className="text-sm text-black/60">{invite.email}</p>
              </div>
              <div>
                <p className="text-xs text-black/30 mb-0.5">Role</p>
                <p className="text-sm text-black/60">{invite.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</p>
              </div>
              <div>
                <p className="text-xs text-black/30 mb-0.5">Your Staff ID</p>
                <p className="text-base font-mono font-semibold text-black tracking-wide">{invite.staffId}</p>
              </div>
            </div>

            <p className="text-xs text-black/30 text-center">
              Save your Staff ID — you&apos;ll need it to sign in.
            </p>

            {error && (
              <p className="text-xs text-red-600 text-center">{error}</p>
            )}

            <button
              onClick={handleAccept}
              disabled={creating}
              className="w-full bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
            >
              {creating ? "Setting up..." : "Create My Account"}
            </button>

            <p className="text-center text-xs text-black/30">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
