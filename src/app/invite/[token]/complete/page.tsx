"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function InviteCompletePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const [staffId, setStaffId] = useState("");

  useEffect(() => {
    async function complete() {
      try {
        const clerkRes = await fetch("/api/auth/me");
        if (!clerkRes.ok) {
          setStatus("error");
          setError("Please sign in first, then visit this link again.");
          return;
        }
        const { userId } = await clerkRes.json();

        const res = await fetch(`/api/staff/invite/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkUserId: userId }),
        });

        const data = await res.json();

        if (res.ok) {
          setStaffId(data.staffId || "");
          setStatus("success");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setStatus("error");
          setError(data.error || "Failed to complete signup");
        }
      } catch {
        setStatus("error");
        setError("Something went wrong");
      }
    }

    if (token) complete();
  }, [token, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-black/40">Setting up your account...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-black mb-2">Something went wrong</h1>
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
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-black mb-2">Welcome to Skuli!</h1>
        <p className="text-sm text-black/40 mb-2">Your account is all set up.</p>
        {staffId && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6">
            <p className="text-xs text-black/30 mb-1">Your Staff ID</p>
            <p className="text-lg font-mono font-semibold text-black tracking-wide">{staffId}</p>
            <p className="text-xs text-black/30 mt-1">Save this — you&apos;ll need it to sign in.</p>
          </div>
        )}
        <p className="text-xs text-black/30">Redirecting to dashboard in 3 seconds...</p>
      </div>
    </div>
  );
}
