"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

type Material = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  type: string;
  fileUrl: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  worksheet: "Worksheet",
  past_paper: "Past Paper",
  other: "Other",
};

const TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  worksheet: "bg-blue-100 text-blue-700",
  past_paper: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

export function StudentMaterials({ studentId }: { studentId: string }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    const res = await fetch("/api/materials");
    if (res.ok) setMaterials(await res.json());
    setLoading(false);
  }

  const subjects = [...new Set(materials.map((m) => m.subject))].sort();
  const filtered = filterSubject ? materials.filter((m) => m.subject === filterSubject) : materials;

  const grouped = filtered.reduce((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m);
    return acc;
  }, {} as Record<string, Material[]>);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      {subjects.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterSubject("")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
              !filterSubject ? "bg-black text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({materials.length})
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                filterSubject === s ? "bg-black text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s} ({materials.filter((m) => m.subject === s).length})
            </button>
          ))}
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {materials.length === 0
            ? "No study materials uploaded yet. Check back soon!"
            : "No materials for this subject."}
        </div>
      ) : (
        Object.entries(grouped).map(([subject, items]) => (
          <div key={subject}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">{subject}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((m) => (
                <a
                  key={m.id}
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-slate-900 text-sm leading-tight">{m.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${TYPE_COLORS[m.type] || TYPE_COLORS.other}`}>
                      {TYPE_LABELS[m.type] || m.type}
                    </span>
                  </div>
                  {m.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{m.description}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">
                    Uploaded {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
