"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AvailableClass {
  id: string;
  name: string;
  grade: number;
  _count: { students: number };
}

export default function ClaimClassPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<AvailableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClasses(data.filter((c: AvailableClass & { classTeacher: unknown }) => !c.classTeacher));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleClaim(classId: string) {
    setClaiming(classId);
    setMessage("");
    const res = await fetch("/api/claim-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    });
    if (res.ok) {
      setMessage("Class claimed successfully! You are now the class teacher.");
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to claim class");
    }
    setClaiming(null);
  }

  if (loading) return <div className="text-sm text-black/40">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">Claim a Class</h1>
        <p className="text-xs text-black/40 mt-0.5">Select a class to become its class teacher</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm text-black/40">All classes have been claimed. No available classes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-black">{cls.name}</p>
                <p className="text-xs text-black/40">{cls._count.students} student{cls._count.students !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => handleClaim(cls.id)}
                disabled={claiming === cls.id}
                className="bg-black text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
              >
                {claiming === cls.id ? "Claiming..." : "Claim"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
