"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type School = { name: string; motto: string | null; logoUrl: string | null; address: string | null };
type Student = { id: string; name: string; admissionNo: string; grade: string; stream: string | null; gender: string | null };
type CbcResult = { id: string; subject: string; rubricLevel: string; term: string; year: number; strand: string | null };
type Competency = { id: string; competency: string; score: string | null; term: string; year: number };

const RUBRIC_INFO: Record<string, { pts: number; desc: string; color: string }> = {
  EE1: { pts: 8, desc: "Exceeding Expectations", color: "bg-green-100 text-green-800" },
  EE2: { pts: 7, desc: "Exceeding Expectations", color: "bg-green-50 text-green-700" },
  ME1: { pts: 6, desc: "Meeting Expectations", color: "bg-blue-100 text-blue-800" },
  ME2: { pts: 5, desc: "Meeting Expectations", color: "bg-blue-50 text-blue-700" },
  AE1: { pts: 4, desc: "Approaching Expectations", color: "bg-amber-100 text-amber-800" },
  AE2: { pts: 3, desc: "Approaching Expectations", color: "bg-amber-50 text-amber-700" },
  BE1: { pts: 2, desc: "Below Expectations", color: "bg-red-100 text-red-800" },
  BE2: { pts: 1, desc: "Below Expectations", color: "bg-red-50 text-red-700" },
};

const COMPETENCY_LABELS: Record<string, string> = {
  COMMUNICATION: "Communication & Collaboration",
  CRITICAL_THINKING: "Critical Thinking & Problem Solving",
  CREATIVITY: "Creativity & Imagination",
  CITIZENSHIP: "Citizenship",
  DIGITAL_LITERACY: "Digital Literacy",
  LEARNING_TO_LEARN: "Learning to Learn",
  SELF_EFFICACY: "Self-Efficacy",
};

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

export function ReportCard({
  student, school, results, competencies,
}: {
  student: Student; school: School; results: CbcResult[]; competencies: Competency[];
}) {
  const latestYear = results.length > 0 ? results[0].year : new Date().getFullYear();
  const latestTerm = results.length > 0 ? results[0].term : "TERM_1";
  const termResults = results.filter((r) => r.year === latestYear && r.term === latestTerm);
  const termCompetencies = competencies.filter((c) => c.year === latestYear && c.term === latestTerm);

  const totalPoints = termResults.reduce((sum, r) => sum + (RUBRIC_INFO[r.rubricLevel]?.pts || 0), 0);
  const avgPoints = termResults.length > 0 ? (totalPoints / termResults.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏫</span>
            </div>
            <h1 className="text-2xl font-bold">{school.name}</h1>
            {school.motto && <p className="text-indigo-200 text-sm mt-1 italic">&ldquo;{school.motto}&rdquo;</p>}
            {school.address && <p className="text-indigo-100 text-sm mt-1">{school.address}</p>}
            <p className="text-indigo-200 text-sm mt-3 font-medium">CBC Progress Report Card</p>
          </div>

          {/* Student Info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Student Name</p><p className="font-semibold">{student.name}</p></div>
              <div><p className="text-gray-500">Admission No.</p><p className="font-semibold font-mono">{student.admissionNo}</p></div>
              <div><p className="text-gray-500">Grade</p><p className="font-semibold">{student.grade}{student.stream ? ` - ${student.stream}` : ""}</p></div>
              <div><p className="text-gray-500">Term / Year</p><p className="font-semibold">{TERM_LABELS[latestTerm]} {latestYear}</p></div>
            </div>
          </div>

          {/* Subject Results */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">CBC Assessment Results</h2>
            {termResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No results available for this term.</p>
            ) : (
              <div className="space-y-2">
                {termResults.map((r) => {
                  const info = RUBRIC_INFO[r.rubricLevel];
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-medium">{r.subject}</span>
                        {r.strand && <span className="text-xs text-gray-400 ml-2">({r.strand})</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={info?.color || "bg-gray-100"}>{r.rubricLevel}</Badge>
                        <span className="text-xs text-gray-500 w-32">{info?.desc} ({info?.pts} pts)</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-100 mt-2">
                  <span className="font-semibold text-indigo-900">Average Points</span>
                  <span className="text-lg font-bold text-indigo-700">{avgPoints} / 8</span>
                </div>
              </div>
            )}
          </div>

          {/* Core Competencies */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Core Competencies</h2>
            {termCompetencies.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No competency data available.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {termCompetencies.map((c) => {
                  const info = c.score ? RUBRIC_INFO[c.score] : null;
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded border border-gray-100">
                      <span className="text-sm">{COMPETENCY_LABELS[c.competency] || c.competency}</span>
                      {info && <Badge className={info.color}>{c.score}</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">Powered by Skuli — Smart ERP for Kenyan CBC Schools</p>
              <Button variant="outline" size="sm" onClick={() => window.print()}>🖨️ Print</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
