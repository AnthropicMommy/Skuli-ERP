"use client";

import { useState } from "react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  subject: string;
  grade: string;
  materialType: string;
  fileSize: number | null;
  fileUrl: string;
}

interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  category: string | null;
  copies: number;
  available: number;
}

export function LibraryContent({ initialMaterials, books }: { initialMaterials: Material[]; books: Book[] }) {
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  const gradeOrder = ["1", "4", "5", "6", "7", "8", "9", "10", "11"];
  const byGrade: Record<string, Material[]> = {};
  for (const m of initialMaterials) {
    if (!byGrade[m.grade]) byGrade[m.grade] = [];
    byGrade[m.grade].push(m);
  }
  const availableGrades = gradeOrder.filter((g) => byGrade[g]);

  const filtered = activeGrade
    ? initialMaterials.filter((m) => m.grade === activeGrade)
    : initialMaterials;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Study Library</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {initialMaterials.length} real CBC curriculum materials
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Revision Papers & Notes
          </h2>

          {/* Clickable grade filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveGrade(null)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                activeGrade === null
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--surface)] border-border text-[var(--text-secondary)] hover:border-[var(--accent)]"
              }`}
            >
              All ({initialMaterials.length})
            </button>
            {availableGrades.map((grade) => (
              <button
                key={grade}
                onClick={() => setActiveGrade(activeGrade === grade ? null : grade)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  activeGrade === grade
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--surface)] border-border text-[var(--text-secondary)] hover:border-[var(--accent)]"
                }`}
              >
                Grade {grade} ({byGrade[grade].length})
              </button>
            ))}
          </div>

          {/* Materials grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((material) => (
              <Link
                key={material.id}
                href={`/student/library/view/${material.id}`}
                className="bg-[var(--surface)] rounded-xl border border-border p-4 hover:border-[var(--accent)]/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--text-primary)] text-sm truncate">
                      {material.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{material.subject}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        material.materialType === "past_paper"
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : material.materialType === "curriculum_design"
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      }`}
                    >
                      {material.materialType === "past_paper"
                        ? "Past Paper"
                        : material.materialType === "curriculum_design"
                        ? "Curriculum"
                        : material.materialType === "scheme"
                        ? "Scheme"
                        : material.materialType === "exam_paper"
                        ? "Exam"
                        : "Notes"}
                    </span>
                    <a
                      href={material.fileUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md hover:bg-[var(--background)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                      title="Download"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--text-tertiary)]">
                  <span>Grade {material.grade}</span>
                  {material.fileSize != null && material.fileSize > 0 && (
                    <span>{(material.fileSize / 1024).toFixed(0)}KB</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">No materials found</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {activeGrade ? "Try a different grade" : "Materials will appear here soon"}
              </p>
            </div>
          )}
        </section>

        <hr className="border-border" />

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">School Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div key={book.id} className="bg-[var(--surface)] rounded-xl border border-border p-5">
                <h3 className="font-semibold text-[var(--text-primary)]">{book.title}</h3>
                {book.author && <p className="text-sm text-[var(--text-secondary)] mt-1">by {book.author}</p>}
                <div className="flex items-center gap-3 mt-3">
                  {book.isbn && <span className="text-xs text-[var(--text-tertiary)]">ISBN: {book.isbn}</span>}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      book.available > 0
                        ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                        : "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"
                    }`}
                  >
                    {book.available} of {book.copies} available
                  </span>
                </div>
                {book.category && (
                  <span className="text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full mt-2 inline-block border border-border">
                    {book.category}
                  </span>
                )}
              </div>
            ))}
            {books.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">No books yet</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Your school library catalog will appear here</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
