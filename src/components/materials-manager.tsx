"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Material = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  type: string;
  fileUrl: string;
  classId: string;
  createdAt: string;
};

type Class = {
  id: string;
  name: string;
  grade: number;
  _count: { students: number };
};

const SUBJECTS = [
  "Literacy", "Indigenous Language", "Kiswahili / KSL", "English",
  "Mathematics", "Environmental Activities", "Religious Education",
  "Movement & Creative Activities", "Science & Technology", "Social Studies",
  "Agriculture & Nutrition", "Creative Arts", "Physical & Health Education",
  "Home Science",
];

const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "worksheet", label: "Worksheet" },
  { value: "past_paper", label: "Past Paper" },
  { value: "other", label: "Other" },
];

export function MaterialsManager({ schoolId }: { schoolId: string }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("pdf");
  const [classId, setClassId] = useState("");

  useEffect(() => {
    fetchClasses();
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filterClass, filterSubject]);

  async function fetchClasses() {
    const res = await fetch("/api/classes");
    if (res.ok) setClasses(await res.json());
  }

  async function fetchMaterials() {
    const params = new URLSearchParams();
    if (filterClass) params.set("classId", filterClass);
    if (filterSubject) params.set("subject", filterSubject);
    const res = await fetch(`/api/materials?${params}`);
    if (res.ok) setMaterials(await res.json());
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !subject || !classId) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("type", type);
    formData.append("classId", classId);

    const res = await fetch("/api/materials", { method: "POST", body: formData });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setFile(null);
      setSubject("");
      setClassId("");
      setShowUpload(false);
      fetchMaterials();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this material?")) return;
    const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
    if (res.ok) fetchMaterials();
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const getClassGrade = (cid: string) => classes.find((c) => c.id === cid)?.grade;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Classes Covered</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(materials.map((m) => m.classId)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Subjects Covered</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(materials.map((m) => m.subject)).size}
          </p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition"
        >
          {showUpload ? "Cancel" : "Upload Material"}
        </button>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="border border-gray-200 rounded-lg text-xs px-2 py-1.5"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c._count.students} students)</option>
          ))}
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border border-gray-200 rounded-lg text-xs px-2 py-1.5"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {showUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Upload Revision Material</h3>
          <form onSubmit={handleUpload} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">File *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PNG, JPG, TXT — max 20MB</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Term 2 Past Paper - Mathematics Grade 4"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Class *</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} required className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !file || !title || !subject || !classId}
                className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Study Materials ({materials.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No materials uploaded yet. Click &quot;Upload Material&quot; above.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {m.title}
                    </a>
                    {m.description && <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{m.subject}</Badge></TableCell>
                  <TableCell className="text-sm">Grade {getClassGrade(m.classId) || "?"}</TableCell>
                  <TableCell><Badge variant="outline">{TYPES.find((t) => t.value === m.type)?.label || m.type}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
