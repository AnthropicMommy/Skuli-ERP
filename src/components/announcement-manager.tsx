"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: string;
  classId: string | null;
  authorName: string | null;
  createdAt: string;
};

type Class = {
  id: string;
  name: string;
  grade: number;
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

export function AnnouncementManager({ schoolId }: { schoolId: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [classId, setClassId] = useState("");

  useEffect(() => {
    fetchAnnouncements();
    fetch("/api/classes").then((r) => r.json()).then(setClasses);
  }, []);

  async function fetchAnnouncements() {
    const res = await fetch("/api/announcements");
    if (res.ok) setAnnouncements(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, priority, classId: classId || null }),
    });
    if (res.ok) {
      setTitle("");
      setContent("");
      setPriority("normal");
      setClassId("");
      setShowForm(false);
      fetchAnnouncements();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition"
        >
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm mb-3">Create Announcement</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. End of Term Assembly"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                placeholder="Announcement details..."
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Class (optional)</label>
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                  <option value="">All classes (school-wide)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !title || !content}
              className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Announcements ({announcements.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No announcements yet.
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {a.classId ? classes.find((c) => c.id === a.classId)?.name || "Class" : "School-wide"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal}`}>
                      {a.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{a.authorName || "-"}</TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
