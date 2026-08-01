"use client";

import { useState, useEffect } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science & Technology", "Social Studies",
  "Creative Arts", "Physical & Health Ed.", "Religious Education", "Agriculture",
  "Computer Science", "Home Science", "Pre-Technical", "Foreign Languages",
  "Integrated Science", "German", "French", "Mandarin", "Break", "Free Study",
];

const HOURS = ["6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const MINUTES = ["00", "15", "30", "45"];

interface TimetableEntry {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
}

function to12Hour(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function to24Hour(hour12: string, minute: string, period: string): string {
  let h = Number(hour12);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function hasOverlap(a: TimetableEntry, b: TimetableEntry): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export default function StudyTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<{
    dayOfWeek: number;
    startHour: string;
    startMinute: string;
    startPeriod: string;
    endHour: string;
    endMinute: string;
    endPeriod: string;
    subject: string;
  }>({
    dayOfWeek: 0,
    startHour: "8",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "9",
    endMinute: "00",
    endPeriod: "AM",
    subject: "Mathematics",
  });

  useEffect(() => {
    fetchTimetable();
    startNotificationCheck();
  }, []);

  async function fetchTimetable() {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) return;
    const res = await fetch("/api/study-timetable", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setEntries(data.timetable);
    }
    setLoading(false);
  }

  function checkConflict(): string | null {
    const startTime = to24Hour(newEntry.startHour, newEntry.startMinute, newEntry.startPeriod);
    const endTime = to24Hour(newEntry.endHour, newEntry.endMinute, newEntry.endPeriod);
    const testEntry: TimetableEntry = { dayOfWeek: newEntry.dayOfWeek, startTime, endTime, subject: newEntry.subject };

    for (const existing of entries) {
      if (hasOverlap(testEntry, existing)) {
        return `This overlaps with ${existing.subject} (${to12Hour(existing.startTime)} - ${to12Hour(existing.endTime)})`;
      }
    }
    return null;
  }

  function handleAdd() {
    const overlap = checkConflict();
    if (overlap) {
      setConflict(overlap);
      return;
    }
    addEntry();
  }

  function addEntry() {
    const startTime = to24Hour(newEntry.startHour, newEntry.startMinute, newEntry.startPeriod);
    const endTime = to24Hour(newEntry.endHour, newEntry.endMinute, newEntry.endPeriod);
    setEntries((prev) => [...prev, { dayOfWeek: newEntry.dayOfWeek, startTime, endTime, subject: newEntry.subject, id: `temp-${Date.now()}` }]);
    setShowAdd(false);
    setConflict(null);
    setNewEntry({
      dayOfWeek: 0, startHour: "8", startMinute: "00", startPeriod: "AM",
      endHour: "9", endMinute: "00", endPeriod: "AM", subject: "Mathematics",
    });
  }

  function removeEntry(idx: number) {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveTimetable() {
    setSaving(true);
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) return;
    await fetch("/api/study-timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ entries }),
    });
    setSaving(false);
    setEditing(false);
  }

  function startNotificationCheck() {
    setInterval(() => {
      const now = new Date();
      const currentDay = (now.getDay() + 6) % 7;
      entries.forEach((entry) => {
        if (entry.dayOfWeek === currentDay) {
          const diffMins = timeToMinutes(entry.startTime) - (now.getHours() * 60 + now.getMinutes());
          if (diffMins >= 0 && diffMins <= 5) {
            const msg = `📚 ${entry.subject} Time! Starting in ${diffMins === 0 ? "now" : `${diffMins} minutes`}`;
            if (!notifications.includes(msg)) {
              setNotifications((prev) => [...prev, msg]);
              if (Notification.permission === "granted") {
                new Notification("Skuli Study Reminder", { body: `${entry.subject} starts ${diffMins === 0 ? "now" : `in ${diffMins} minutes`}` });
              }
            }
          }
        }
      });
    }, 30000);
  }

  if (loading) {
    return <div className="text-center py-16"><div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Study Timetable</h1>
          <p className="text-[var(--text-secondary)] mt-1">Plan your study time</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition">Cancel</button>
              <button onClick={saveTimetable} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-[#0A0A0A] text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg bg-primary text-[#0A0A0A] text-sm font-medium hover:bg-primary/90 transition">Edit</button>
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2 mb-6">
          {notifications.map((msg, i) => (
            <div key={i} className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
              <span className="text-sm text-primary font-medium">{msg}</span>
              <button onClick={() => setNotifications((prev) => prev.filter((n) => n !== msg))} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {DAYS.map((day, idx) => {
          const dayEntries = entries.filter((e) => e.dayOfWeek === idx);
          return (
            <div key={day} className="bg-[var(--surface)] rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-[var(--surface-hover)] border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">{day}</h2>
                {editing && (
                  <button onClick={() => { setNewEntry({ ...newEntry, dayOfWeek: idx }); setShowAdd(true); setConflict(null); }} className="text-xs text-primary hover:text-primary/80 font-medium">+ Add</button>
                )}
              </div>
              {dayEntries.length > 0 ? (
                <div className="divide-y divide-border">
                  {dayEntries.map((entry, i) => (
                    <div key={entry.id || i} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-primary rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{entry.subject}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{to12Hour(entry.startTime)} - {to12Hour(entry.endTime)}</p>
                        </div>
                      </div>
                      {editing && (
                        <button onClick={() => removeEntry(entries.indexOf(entry))} className="text-[var(--text-tertiary)] hover:text-[var(--destructive)]">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">{editing ? "No sessions — tap + Add" : "No study sessions"}</div>
              )}
            </div>
          );
        })}

        {/* Empty state when no entries at all */}
        {entries.length === 0 && !editing && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No study plan yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-4">Plan your study time to stay on track</p>
            <button onClick={() => setEditing(true)} className="text-xs text-primary font-medium hover:underline">Start building your timetable</button>
          </div>
        )}
      </div>

      {/* Add modal — simple AM/PM picker */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-border rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Add Study Time</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Subject</label>
                <select value={newEntry.subject} onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Start Time</label>
                <div className="flex gap-2">
                  <select value={newEntry.startHour} onChange={(e) => setNewEntry({ ...newEntry, startHour: e.target.value })}
                    className="flex-1 px-3 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-[var(--text-secondary)] self-center">:</span>
                  <select value={newEntry.startMinute} onChange={(e) => setNewEntry({ ...newEntry, startMinute: e.target.value })}
                    className="flex-1 px-3 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={newEntry.startPeriod} onChange={(e) => setNewEntry({ ...newEntry, startPeriod: e.target.value })}
                    className="w-20 px-3 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] font-medium focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">End Time</label>
                <div className="flex gap-2">
                  <select value={newEntry.endHour} onChange={(e) => setNewEntry({ ...newEntry, endHour: e.target.value })}
                    className="flex-1 px-3 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-[var(--text-secondary)] self-center">:</span>
                  <select value={newEntry.endMinute} onChange={(e) => setNewEntry({ ...newEntry, endMinute: e.target.value })}
                    className="flex-1 px-3 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={newEntry.endPeriod} onChange={(e) => setNewEntry({ ...newEntry, endPeriod: e.target.value })}
                    className="w-20 px-3 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] font-medium focus:border-[var(--border-strong)] focus:outline-none transition-colors">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Conflict warning */}
              {conflict && (
                <div className="bg-[var(--rubric-ae)]/10 border border-[var(--rubric-ae)]/20 rounded-lg p-3">
                  <p className="text-sm text-[var(--rubric-ae)] font-medium">⚠️ Conflict!</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{conflict}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setConflict(null); addEntry(); }} className="flex-1 px-3 py-2 rounded-lg border border-border text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition">
                      Ignore
                    </button>
                    <button onClick={() => setConflict(null)} className="flex-1 px-3 py-2 rounded-lg bg-primary text-[#0A0A0A] text-xs font-medium hover:bg-primary/90 transition">
                      Adjust
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setShowAdd(false); setConflict(null); }} className="flex-1 px-4 py-3 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition">Cancel</button>
                <button onClick={handleAdd} className="flex-1 px-4 py-3 rounded-lg bg-primary text-[#0A0A0A] text-sm font-medium hover:bg-primary/90 transition">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
