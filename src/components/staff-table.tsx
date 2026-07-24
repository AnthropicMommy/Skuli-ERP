"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/roles";
import type { SchoolRole } from "@/generated/prisma/client";

type StaffMember = {
  id: string;
  name: string;
  role: SchoolRole;
  tscGrade: string | null;
  tscNumber: string | null;
  qualification: string | null;
  department: { name: string } | null;
  phone: string | null;
};

const roleColors: Record<string, string> = {
  PRINCIPAL: "bg-slate-100 text-slate-700",
  DEPUTY_ACADEMICS: "bg-blue-100 text-blue-700",
  DEPUTY_ADMIN: "bg-blue-100 text-blue-700",
  BURSAR: "bg-green-100 text-green-700",
  HOD: "bg-amber-100 text-amber-700",
  CLASS_TEACHER: "bg-indigo-100 text-indigo-700",
  TEACHER: "bg-gray-100 text-gray-700",
  NURSE: "bg-pink-100 text-pink-700",
  LIBRARIAN: "bg-cyan-100 text-cyan-700",
};

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const [search, setSearch] = useState("");

  const filtered = staff.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>TSC Grade</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No staff found.</TableCell></TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge className={roleColors[s.role] || "bg-gray-100 text-gray-700"}>{getRoleLabel(s.role)}</Badge></TableCell>
                  <TableCell>{s.department?.name || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{s.tscGrade || "-"}</TableCell>
                  <TableCell className="text-sm">{s.qualification || "-"}</TableCell>
                  <TableCell className="text-sm">{s.phone || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
