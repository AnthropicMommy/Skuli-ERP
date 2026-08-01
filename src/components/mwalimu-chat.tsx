"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SessionInfo {
  tokensUsed: number;
  maxTokens: number;
  tokensRemaining: number;
  expiresAt: string;
}

export function MwalimuChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState("");
  const [isIndependent, setIsIndependent] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionError, setSessionError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      const cookie = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="));
      if (cookie) {
        const token = cookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.classId) setClassId(payload.classId);
        if (payload.isIndependent) setIsIndependent(true);
      }
    } catch {}
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setSessionError("");

    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];

    try {
      const res = await fetch("/api/mwalimu", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: userMsg,
          subject: subject || undefined,
          classId: classId || undefined,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.session) {
          setSession(data.session);
        }
      } else {
        const errMsg = data.error || "Something went wrong. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Check your connection and try again." }]);
    }

    setLoading(false);
  }

  return (
    <>
      {/* Toggle button in sidebar */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
          open
            ? "bg-[var(--sidebar-accent)] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--text-primary)]"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75a.75.75 0 00-.75.75v1.5" />
        </svg>
        Mwalimu AI
        {messages.length > 0 && (
          <span className="ml-auto w-2 h-2 rounded-full bg-[var(--accent)]" />
        )}
      </button>

      {/* Chat panel — slides open below the sidebar */}
      {open && (
        <div className="border-t border-border bg-[var(--background)] flex flex-col" style={{ height: "400px" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Mwalimu</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">AI Learning Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
          </div>

          {/* Session info */}
          {isIndependent && session && (
            <div className="px-3 py-1 border-b border-border shrink-0">
              <p className="text-[10px] text-[var(--text-tertiary)]">Free unlimited sessions</p>
            </div>
          )}

          {/* Subject picker */}
          {!subject && messages.length === 0 && (
            <div className="p-3 shrink-0">
              <p className="text-xs text-[var(--text-secondary)] mb-2">What subject?</p>
              <div className="flex flex-wrap gap-1.5">
                {["Mathematics", "English", "Kiswahili", "Science", "Social Studies"].map((s) => (
                  <button key={s} onClick={() => { setSubject(s); setMessages([{ role: "assistant", content: `Ready to help with ${s}. What would you like to learn?` }]); }} className="text-[10px] bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-1 rounded border border-border hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                  msg.role === "user"
                    ? "bg-[var(--surface-hover)] text-[var(--text-primary)] rounded-br-sm"
                    : "bg-[var(--background)] text-[var(--text-secondary)] border border-border rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--background)] border border-border rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-tertiary)] rounded-bl-sm">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-border p-2 flex gap-1.5 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sessionError ? "Session ended" : "Ask Mwalimu..."}
              disabled={!!sessionError}
              className="flex-1 px-2.5 py-1.5 border border-border rounded-lg text-xs bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[var(--border-strong)] transition-colors disabled:opacity-50"
            />
            <button type="submit" disabled={loading || !input.trim() || !!sessionError} className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
