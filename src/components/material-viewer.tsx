"use client";

import Link from "next/link";
import { useState } from "react";

interface MaterialViewerProps {
  fileUrl: string;
  title: string;
  subject: string;
  grade: string;
  materialType: string;
}

export function MaterialViewer({ fileUrl, title, subject, grade, materialType }: MaterialViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[var(--background)] shrink-0">
        <Link
          href="/student/library"
          className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
        >
          <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</h1>
          <p className="text-xs text-[var(--text-tertiary)]">
            Grade {grade} &middot; {subject}
            {materialType === "past_paper" && " &middot; Past Paper"}
            {materialType === "curriculum_design" && " &middot; Curriculum"}
            {materialType === "scheme" && " &middot; Scheme"}
            {materialType === "exam_paper" && " &middot; Exam"}
          </p>
        </div>
        <a
          href={fileUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </a>
      </header>

      {/* PDF viewer */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-[var(--text-tertiary)]">Loading document...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <div className="w-12 h-12 bg-[var(--destructive)]/10 rounded-xl flex items-center justify-center border border-[var(--destructive)]/20">
                <svg className="w-6 h-6 text-[var(--destructive)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Couldn&apos;t load document</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Open in new tab instead
              </a>
            </div>
          </div>
        )}
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          title={title}
        />
      </div>
    </div>
  );
}
