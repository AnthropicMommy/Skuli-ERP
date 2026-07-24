"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Student = {
  id: string;
  admissionNo: string;
  name: string;
  grade: string;
  stream: string | null;
  gender: string | null;
  parentPhone: string | null;
};

export function StudentsTable({ students, schoolId }: { students: Student[]; schoolId: string }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ admissionNo: "", name: "", grade: "", stream: "", gender: "M", parentName: "", parentPhone: "" });

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.admissionNo.toLowerCase().includes(search.toLowerCase()) || s.grade.toLowerCase().includes(search.toLowerCase())
  );

  async function addStudent() {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, schoolId }),
    });
    if (res.ok) {
      setShowAdd(false);
      window.location.reload();
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger render={<Button>Add Student</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div><Label>Admission No.</Label><Input value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} placeholder="SJ/2024/006" /></div>
              <div><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Mwangi" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Grade</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Grade 3" /></div>
                <div><Label>Stream</Label><Input value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} placeholder="North" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Gender</Label><select className="w-full border rounded-md px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="M">Male</option><option value="F">Female</option></select></div>
              </div>
              <div><Label>Parent Name</Label><Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></div>
              <div><Label>Parent Phone</Label><Input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="+254712345678" /></div>
              <Button onClick={addStudent} className="w-full">Add Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adm No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">{students.length === 0 ? "No students yet." : "No matches."}</TableCell></TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.admissionNo}</TableCell>
                  <TableCell className="font-medium">
                    <a href={`/report/${s.id}`} className="text-indigo-600 hover:underline">{s.name}</a>
                  </TableCell>
                  <TableCell>{s.grade}</TableCell>
                  <TableCell>{s.stream || "-"}</TableCell>
                  <TableCell>{s.gender || "-"}</TableCell>
                  <TableCell>
                    <a href={`/report/${s.id}`} className="text-xs text-indigo-600 hover:text-indigo-700">View Report →</a>
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
