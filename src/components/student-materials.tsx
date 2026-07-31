"use client";

import { useState, useEffect } from "react";

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
  pdf: "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20",
  worksheet: "bg-primary/10 text-primary border-primary/20",
  past_paper: "bg-[var(--rubric-ae)]/10 text-[var(--rubric-ae)] border-[var(--rubric-ae)]/20",
  other: "bg-[var(--surface-hover)] text-[var(--text-secondary)] border-border",
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
    return <div className="text-center py-12 text-[var(--text-tertiary)]">Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      {subjects.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterSubject("")}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
              !filterSubject ? "bg-primary text-[#0A0A0A] border-primary" : "bg-[var(--surface)] text-[var(--text-secondary)] border-border hover:bg-[var(--surface-hover)]"
            }`}
          >
            All ({materials.length})
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition border ${
                filterSubject === s ? "bg-primary text-[#0A0A0A] border-primary" : "bg-[var(--surface)] text-[var(--text-secondary)] border-border hover:bg-[var(--surface-hover)]"
              }`}
            >
              {s} ({materials.filter((m) => m.subject === s).length})
            </button>
          ))}
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-[var(--text-tertiary)]">
          {materials.length === 0
            ? "No study materials uploaded yet. Check back soon!"
            : "No materials for this subject."}
        </div>
      ) : (
        Object.entries(grouped).map(([subject, items]) => (
          <div key={subject}>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{subject}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((m) => (
                <a
                  key={m.id}
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--surface)] rounded-xl border border-border p-4 hover:border-[var(--border-strong)] transition block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-[var(--text-primary)] text-sm leading-tight">{m.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap border ${TYPE_COLORS[m.type] || TYPE_COLORS.other}`}>
                      {TYPE_LABELS[m.type] || m.type}
                    </span>
                  </div>
                  {m.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2">{m.description}</p>
                  )}
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
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
