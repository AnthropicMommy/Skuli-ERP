"use client";

/**
 * ReportCard — CBC report card display component.
 *
 * DROP-IN INSTRUCTIONS FOR OPENCODE:
 * - Save this at: src/components/report-card.tsx
 * - Reuse the EXISTING hook at src/hooks/use-parallax-tilt.ts — do not write new tilt math.
 *   If the hook's exported name/signature differs from the import below, adjust the import
 *   line only. Do not change how the hook itself calculates rotation.
 * - Wire real data from GET /api/cbc?studentId=... — replace the `ReportCardProps` shape
 *   below with whatever the actual API returns if field names differ, but keep the
 *   component structure and class names as-is.
 * - This component takes an `interactive` prop: true = desktop teacher/parent dashboard
 *   view (tilt enabled), false = public parent link (/report/[studentId]) and ALL mobile
 *   viewports (tilt disabled, flat static card). Tilt must never apply on touch devices.
 */

import { useRef } from "react";
import { useParallaxTilt } from "@/hooks/use-parallax-tilt"; // adjust path/name to match existing hook

type RubricLevel = "EE1" | "EE2" | "ME1" | "ME2" | "AE1" | "AE2" | "BE1" | "BE2";

interface SubjectResult {
  subject: string;
  rubric: RubricLevel;
  teacherComment?: string;
}

interface CompetencyResult {
  competency: string;
  rubric: RubricLevel;
}

interface ReportCardProps {
  schoolName: string;
  studentName: string;
  admissionNumber: string;
  grade: string;
  term: string;
  year: string;
  subjects: SubjectResult[];
  competencies: CompetencyResult[];
  classTeacherComment?: string;
  interactive?: boolean; // default false — caller must explicitly opt into tilt
}

const RUBRIC_COLOR: Record<RubricLevel, string> = {
  EE1: "var(--rubric-ee)",
  EE2: "var(--rubric-ee)",
  ME1: "var(--rubric-me)",
  ME2: "var(--rubric-me)",
  AE1: "var(--rubric-ae)",
  AE2: "var(--rubric-ae)",
  BE1: "var(--rubric-be)",
  BE2: "var(--rubric-be)",
};

const RUBRIC_LABEL: Record<RubricLevel, string> = {
  EE1: "Exceeding Expectation",
  EE2: "Exceeding Expectation",
  ME1: "Meeting Expectation",
  ME2: "Meeting Expectation",
  AE1: "Approaching Expectation",
  AE2: "Approaching Expectation",
  BE1: "Below Expectation",
  BE2: "Below Expectation",
};

function RubricBadge({ level }: { level: RubricLevel }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium"
      style={{
        borderColor: RUBRIC_COLOR[level],
        color: RUBRIC_COLOR[level],
        backgroundColor: `color-mix(in srgb, ${RUBRIC_COLOR[level]} 12%, transparent)`,
      }}
      title={RUBRIC_LABEL[level]}
    >
      {level}
    </span>
  );
}

export function ReportCard({
  schoolName,
  studentName,
  admissionNumber,
  grade,
  term,
  year,
  subjects,
  competencies,
  classTeacherComment,
  interactive = false,
}: ReportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Tilt is ONLY wired up when interactive=true. On mobile / public parent view,
  // interactive must be passed as false by the caller — do not detect viewport
  // width inside this component; the parent decides.
  const tiltStyle = interactive ? useParallaxTilt(cardRef, { maxTilt: 6 }) : undefined;

  return (
    <div
      ref={cardRef}
      style={tiltStyle}
      className="mx-auto w-full max-w-2xl rounded-xl border p-6 sm:p-8"
      // Tilt transform applies ONLY to this outer wrapper. Every element below
      // is flat, static content — never attach transforms to children.
      // Uses existing design tokens — do not hardcode colors here.
      // border: var(--border), background: var(--surface)
    >
      <header className="mb-6 flex items-start justify-between border-b pb-4"
        style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            {schoolName}
          </p>
          <h2 className="mt-1 text-xl font-medium" style={{ color: "var(--text-primary)" }}>
            {studentName}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Adm. No. {admissionNumber} · Grade {grade}
          </p>
        </div>
        <div className="text-right text-sm" style={{ color: "var(--text-secondary)" }}>
          <p>{term}</p>
          <p>{year}</p>
        </div>
      </header>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Subjects
        </h3>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div
              key={s.subject}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {s.subject}
              </span>
              <RubricBadge level={s.rubric} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Core Competencies
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {competencies.map((c) => (
            <div
              key={c.competency}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {c.competency}
              </span>
              <RubricBadge level={c.rubric} />
            </div>
          ))}
        </div>
      </section>

      {classTeacherComment ? (
        <section className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
          <p className="mb-1 text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
            Class Teacher&apos;s Comment
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {classTeacherComment}
          </p>
        </section>
      ) : null}
    </div>
  );
}
