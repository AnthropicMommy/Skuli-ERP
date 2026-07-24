"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface School {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  grade: number;
}

export default function StudentSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"school" | "details" | "classes">("school");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [name, setName] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [grade, setGrade] = useState("1");
  const [password, setPassword] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [sameAsParent, setSameAsParent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchSchools(query: string) {
    setSchoolQuery(query);
    if (query.length < 2) { setSchools([]); return; }
    const res = await fetch(`/api/schools/search?q=${encodeURIComponent(query)}`);
    if (res.ok) setSchools(await res.json());
  }

  async function selectSchool(school: School) {
    setSelectedSchool(school);
    const res = await fetch(`/api/classes?schoolId=${school.id}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setClasses(data);
    }
    setStep("details");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/student/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: selectedSchool?.id,
        name,
        admissionNo,
        grade,
        password,
        parentEmail: sameAsParent ? null : parentEmail,
        sameAsParent,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      document.cookie = `skuli_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      if (selectedClass) {
        await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` },
          body: JSON.stringify({ classId: selectedClass }),
        });
      }
      router.push("/student");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {step === "school" && (
        <>
          <div>
            <label className="block text-sm font-medium text-black/70 mb-1.5">School</label>
            <input type="text" value={schoolQuery} onChange={(e) => searchSchools(e.target.value)} placeholder="Search for your school..." className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
          </div>
          {schools.length > 0 && (
            <div className="border border-black/5 rounded-lg divide-y divide-black/5 max-h-48 overflow-y-auto">
              {schools.map((s) => (
                <button key={s.id} onClick={() => selectSchool(s)} className="w-full text-left px-3 py-2.5 hover:bg-black/5 transition-colors">
                  <p className="text-sm font-medium text-black">{s.name}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {step === "details" && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-black/60 bg-black/5 px-3 py-2 rounded-lg">
            {selectedSchool?.name}
            <button type="button" onClick={() => setStep("school")} className="text-black font-medium hover:underline ml-auto text-xs">Change</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Wanjiku Kamau" className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Admission No *</label>
              <input type="text" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} required placeholder="e.g. SJ/2024/001" className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Grade *</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-1">Parent Email (optional)</label>
            <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@email.com" disabled={sameAsParent} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50" />
          </div>

          <label className="flex items-center gap-2 text-sm text-black/60">
            <input type="checkbox" checked={sameAsParent} onChange={(e) => setSameAsParent(e.target.checked)} className="rounded" />
            I don&apos;t have a separate email — use my school login for parent access
          </label>

          {classes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-black/70 mb-1">Join a Class (optional)</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                <option value="">No class selected</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black/80 transition disabled:opacity-50">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
      )}
    </div>
  );
}
