"use client";

import { useState, useEffect } from "react";

interface Material {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  type: string;
  fileUrl: string;
  visibility: string;
  createdAt: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: number;
}

const SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science & Technology",
  "Social Studies", "Creative Arts", "Physical & Health Education",
  "Religious Education (CRE)", "Religious Education (IRE)",
  "Pre-Technical Studies", "Computer Studies", "Agriculture",
  "Business Studies", "Geography", "History", "Physics",
  "Chemistry", "Biology", "Literature", "Home Science",
];

const TYPES = [
  { value: "pdf", label: "PDF Document" },
  { value: "worksheet", label: "Worksheet" },
  { value: "past_paper", label: "Past Paper" },
  { value: "notes", label: "Class Notes" },
  { value: "other", label: "Other" },
];

export default function ContributePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [myMaterials, setMyMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("pdf");
  const [classId, setClassId] = useState("");
  const [visibility, setVisibility] = useState("school");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch("/api/materials?mine=true").then((r) => r.json()),
    ]).then(([classesData, materialsData]) => {
      setClasses(Array.isArray(classesData) ? classesData : []);
      setMyMaterials(Array.isArray(materialsData) ? materialsData : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!file || !title || !subject || !classId) {
      setError("Please fill all required fields and select a file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("type", type);
    formData.append("classId", classId);
    formData.append("visibility", visibility);

    try {
      const res = await fetch("/api/materials", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        return;
      }
      const newMaterial = await res.json();
      setMyMaterials((prev) => [{ ...newMaterial, createdAt: new Date().toISOString() }, ...prev]);
      setSuccess("Material uploaded successfully!");
      setTitle("");
      setDescription("");
      setSubject("");
      setFile(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Upload failed. Please try again.");
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Contribute Materials</h1>
        <p className="text-[var(--text-secondary)] mt-1">Upload study materials for your students or share with all schools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-[var(--surface)] border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Upload Material</h2>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}
          {success && <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-sm px-4 py-2.5 rounded-lg mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm focus:border-primary focus:outline-none" placeholder="e.g. Grade 8 Mathematics End-of-Term" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm focus:border-primary focus:outline-none resize-none" placeholder="Brief description of the material..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Subject *</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm focus:border-primary focus:outline-none">
                  <option value="">Select subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Class *</label>
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm focus:border-primary focus:outline-none">
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} (Grade {c.grade})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm focus:border-primary focus:outline-none">
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Visibility *</label>
                <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm focus:border-primary focus:outline-none">
                  <option value="school">My school only</option>
                  <option value="public">Public library (all schools)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">File *</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.png,.jpg,.txt" className="w-full px-3 py-2 rounded-lg border border-border bg-[var(--background)] text-[var(--text-primary)] text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              <p className="text-xs text-[var(--text-tertiary)] mt-1">PDF, DOC, DOCX, PNG, JPG, or TXT. Max 20MB.</p>
            </div>

            <button type="submit" disabled={uploading} className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload Material"}
            </button>
          </form>
        </div>

        {/* My Contributions */}
        <div className="bg-[var(--surface)] border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">My Contributions</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          ) : myMaterials.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No materials uploaded yet.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {myMaterials.map((m) => (
                <div key={m.id} className="bg-[var(--background)] border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{m.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[var(--text-tertiary)]">{m.subject}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${m.visibility === "public" ? "bg-primary/10 text-primary border border-primary/20" : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-border"}`}>
                          {m.visibility === "public" ? "Public" : "School"}
                        </span>
                      </div>
                    </div>
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-primary hover:text-primary/80 font-medium">View</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
