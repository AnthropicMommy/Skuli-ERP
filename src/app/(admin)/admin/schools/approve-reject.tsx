"use client";

import { useState } from "react";

export function ApproveRejectButtons({ schoolId }: { schoolId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleAction(status: "active" | "rejected") {
    setLoading(true);
    await fetch("/api/admin/schools", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, status }),
    });
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleAction("active")}
        disabled={loading}
        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-30 px-2 py-1"
      >
        Approve
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-30 px-2 py-1"
      >
        Reject
      </button>
    </div>
  );
}
