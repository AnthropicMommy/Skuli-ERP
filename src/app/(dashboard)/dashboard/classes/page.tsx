"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ClassData {
  id: string;
  name: string;
  grade: number;
  classTeacher: { id: string; name: string; role: string } | null;
  _count: { students: number; coTeachers: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("1");
  const [creating, setCreating] = useState(false);
  const [pendingEnrollments, setPendingEnrollments] = useState<{ id: string; student: { name: string; admissionNo: string }; class: { name: string } }[]>([]);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClasses(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName || `Grade ${newGrade}`, grade: Number(newGrade) }),
    });
    if (res.ok) {
      const cls = await res.json();
      setClasses((prev) => [...prev, { ...cls, classTeacher: null, _count: { students: 0, coTeachers: 0 } }]);
      setShowCreate(false);
      setNewName("");
      setNewGrade("1");
    }
    setCreating(false);
  }

  if (loading) return <div className="text-sm text-black/40">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Classes</h1>
          <p className="text-xs text-black/40 mt-0.5">{classes.length} class{classes.length !== 1 ? "es" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition"
        >
          {showCreate ? "Cancel" : "+ Create Class"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-black mb-4">Create New Class</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Grade</label>
                <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                  {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">Class Name (optional)</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={`Grade ${newGrade}`} className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
              </div>
            </div>
            <button type="submit" disabled={creating} className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
              {creating ? "Creating..." : "Create Class"}
            </button>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm text-black/40">No classes yet. Create your first class above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/dashboard/classes/${cls.id}`} className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-black/20 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">{cls.name}</p>
                  <p className="text-xs text-black/40 mt-0.5">
                    {cls._count.students} student{cls._count.students !== 1 ? "s" : ""}
                    {cls._count.coTeachers > 0 && ` · ${cls._count.coTeachers} co-teacher${cls._count.coTeachers !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-right">
                  {cls.classTeacher ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {cls.classTeacher.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      No teacher assigned
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
