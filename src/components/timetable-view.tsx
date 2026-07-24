"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type TimetableEntry = {
  id: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string | null;
  staff: { name: string } | null;
};

type Staff = { id: string; name: string };

export function TimetableView({ grades, timetable, staff, schoolId }: { grades: string[]; timetable: TimetableEntry[]; staff: Staff[]; schoolId: string }) {
  const [selectedGrade, setSelectedGrade] = useState(grades[0] || "");
  const [showAdd, setShowAdd] = useState(false);
  const [addDay, setAddDay] = useState(0);
  const [addPeriod, setAddPeriod] = useState(1);
  const [addSubject, setAddSubject] = useState("");
  const [addStaffId, setAddStaffId] = useState("");
  const [addRoom, setAddRoom] = useState("");
  const [addStart, setAddStart] = useState("08:00");
  const [addEnd, setAddEnd] = useState("08:40");
  const [adding, setAdding] = useState(false);

  const filtered = timetable;

  function getEntry(dayIndex: number, period: number) {
    return filtered.find((t) => t.dayOfWeek === dayIndex && t.period === period);
  }

  const maxPeriod = timetable.length > 0 ? Math.max(...timetable.map((t) => t.period)) : 7;

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId,
        grade: selectedGrade,
        dayOfWeek: addDay,
        period: addPeriod,
        startTime: addStart,
        endTime: addEnd,
        subject: addSubject,
        staffId: addStaffId || null,
        room: addRoom || null,
      }),
    });
    if (res.ok) window.location.reload();
    setAdding(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Grade</label>
          <Select value={selectedGrade} onValueChange={(v) => setSelectedGrade(v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
            <SelectContent>
              {grades.length === 0 ? (
                <SelectItem value="none" disabled>No grades yet</SelectItem>
              ) : (
                grades.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">{filtered.length} entries</div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition"
        >
          {showAdd ? "Cancel" : "Add Entry"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-sm mb-3">Add Timetable Entry</h3>
          <form onSubmit={addEntry} className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Day</label>
              <select value={addDay} onChange={(e) => setAddDay(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Period</label>
              <input type="number" value={addPeriod} onChange={(e) => setAddPeriod(parseInt(e.target.value))} min={1} max={12} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subject *</label>
              <input type="text" value={addSubject} onChange={(e) => setAddSubject(e.target.value)} required placeholder="e.g. Mathematics" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
              <input type="time" value={addStart} onChange={(e) => setAddStart(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Time</label>
              <input type="time" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Teacher</label>
              <select value={addStaffId} onChange={(e) => setAddStaffId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                <option value="">None</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Room</label>
              <input type="text" value={addRoom} onChange={(e) => setAddRoom(e.target.value)} placeholder="e.g. Room 5" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-3">
              <button type="submit" disabled={adding || !addSubject} className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
                {adding ? "Adding..." : "Add Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {timetable.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <span className="text-3xl block mb-2">📅</span>
          No timetable entries yet. Click &quot;Add Entry&quot; above to create one.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left font-medium text-gray-500 w-24">Period</th>
                  {DAYS.map((day) => (
                    <th key={day} className="p-3 text-left font-medium text-gray-500">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxPeriod }, (_, i) => i + 1).map((period) => (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="p-3">
                      <div className="text-xs font-medium text-gray-900">P{period}</div>
                    </td>
                    {DAYS.map((day, dayIndex) => {
                      const entry = getEntry(dayIndex, period);
                      return (
                        <td key={day} className="p-2">
                          {entry ? (
                            <div className="bg-indigo-50 rounded-lg p-2 text-xs">
                              <div className="font-medium text-indigo-700">{entry.subject}</div>
                              <div className="text-indigo-400 mt-0.5">{entry.staff?.name || "—"}</div>
                              {entry.room && <div className="text-indigo-300 mt-0.5">{entry.room}</div>}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-300">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
