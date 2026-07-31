"use client";

import { useState, useEffect } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science & Technology", "Social Studies",
  "Creative Arts", "Physical & Health Ed.", "Religious Education", "Agriculture",
  "Computer Science", "Home Science", "Pre-Technical", "Foreign Languages",
  "Integrated Science", "German", "French", "Mandarin",
];

interface TimetableEntry {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
}

export default function StudyTimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState<TimetableEntry>({
    dayOfWeek: 0,
    startTime: "08:00",
    endTime: "09:00",
    subject: "Mathematics",
  });

  useEffect(() => {
    fetchTimetable();
    startNotificationCheck();
  }, []);

  async function fetchTimetable() {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) return;

    const res = await fetch("/api/study-timetable", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setEntries(data.timetable);
    }
    setLoading(false);
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

  function addEntry() {
    setEntries((prev) => [...prev, { ...newEntry, id: `temp-${Date.now()}` }]);
    setShowAdd(false);
    setNewEntry({ dayOfWeek: 0, startTime: "08:00", endTime: "09:00", subject: "Mathematics" });
  }

  function removeEntry(idx: number) {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  }

  function startNotificationCheck() {
    // Check every 30 seconds for upcoming study sessions
    setInterval(() => {
      const now = new Date();
      const currentDay = (now.getDay() + 6) % 7; // 0=Monday
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Find entries that start in the next 5 minutes
      entries.forEach((entry) => {
        if (entry.dayOfWeek === currentDay) {
          const [startH, startM] = entry.startTime.split(":").map(Number);
          const entryTime = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
          const diffMins = (startH * 60 + startM) - (now.getHours() * 60 + now.getMinutes());

          if (diffMins >= 0 && diffMins <= 5) {
            const msg = `📚 ${entry.subject} Time! Starting in ${diffMins === 0 ? "now" : `${diffMins} minutes`}`;
            if (!notifications.includes(msg)) {
              setNotifications((prev) => [...prev, msg]);
              // Show browser notification if permitted
              if (Notification.permission === "granted") {
                new Notification("Skuli Study Reminder", { body: `${entry.subject} starts ${diffMins === 0 ? "now" : `in ${diffMins} minutes`}` });
              }
            }
          }
        }
      });
    }, 30000);
  }

  function dismissNotification(msg: string) {
    setNotifications((prev) => prev.filter((n) => n !== msg));
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-6 h-6 border-2 border-[var(--text-tertiary)] border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Study Timetable</h1>
          <p className="text-[var(--text-secondary)] mt-1">Create your personal study schedule</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition">
                Cancel
              </button>
              <button onClick={saveTimetable} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-[#0A0A0A] text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg bg-primary text-[#0A0A0A] text-sm font-medium hover:bg-primary/90 transition">
              Edit Schedule
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2 mb-6">
          {notifications.map((msg, i) => (
            <div key={i} className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
              <span className="text-sm text-primary font-medium">{msg}</span>
              <button onClick={() => dismissNotification(msg)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Timetable grid */}
      <div className="space-y-4">
        {DAYS.map((day, idx) => {
          const dayEntries = entries.filter((e) => e.dayOfWeek === idx);
          return (
            <div key={day} className="bg-[var(--surface)] rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-[var(--surface-hover)] border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">{day}</h2>
                {editing && (
                  <button
                    onClick={() => {
                      setNewEntry({ ...newEntry, dayOfWeek: idx });
                      setShowAdd(true);
                    }}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    + Add
                  </button>
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
                          <p className="text-xs text-[var(--text-secondary)]">{entry.startTime} - {entry.endTime}</p>
                        </div>
                      </div>
                      {editing && (
                        <button onClick={() => removeEntry(entries.indexOf(entry))} className="text-[var(--text-tertiary)] hover:text-[var(--destructive)]">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                  {editing ? "No sessions scheduled — click + Add" : "No study sessions"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add entry modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] border border-border rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Add Study Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Subject</label>
                <select
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Start</label>
                  <input
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">End</label>
                  <input
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-[var(--background)] text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-3 rounded-lg border border-border text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition">
                  Cancel
                </button>
                <button onClick={addEntry} className="flex-1 px-4 py-3 rounded-lg bg-primary text-[#0A0A0A] text-sm font-medium hover:bg-primary/90 transition">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
