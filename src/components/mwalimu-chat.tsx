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
  const [fullscreen, setFullscreen] = useState(false);
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
      } else if (data.error === "session_exhausted" || data.error === "session_limit") {
        setSessionError(data.message);
        // Remove the user message since it wasn't processed
        setMessages((prev) => prev.slice(0, -1));
      }
    } catch {}

    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition z-50 accent-glow"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75a.75.75 0 00-.75.75v1.5" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 flex flex-col bg-[var(--surface)] border border-border ${
      fullscreen ? "inset-0" : "bottom-6 right-6 w-80 h-96 rounded-xl"
    }`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[var(--background)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-border bg-[var(--surface)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.5" />
              <path d="M9 18V12.5L14 9L19 12.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Mwalimu</p>
            <p className="text-xs text-[var(--text-tertiary)]">AI Learning Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setFullscreen(!fullscreen)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1">
            {fullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
            )}
          </button>
          <button onClick={() => setOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Session indicator for independent students */}
      {isIndependent && session && (
        <div className="px-4 py-2 border-b border-border bg-[var(--background)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-1">
            <span>Session tokens</span>
            <span>{session.tokensUsed.toLocaleString()} / {session.maxTokens.toLocaleString()}</span>
          </div>
          <div className="h-1 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(session.tokensUsed / session.maxTokens) * 100}%`,
                backgroundColor: session.tokensUsed / session.maxTokens > 0.8 ? "var(--destructive)" : "var(--primary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Session error banner */}
      {sessionError && (
        <div className="px-4 py-3 border-b border-border bg-[var(--destructive)]/10">
          <p className="text-xs text-[var(--destructive)]">{sessionError}</p>
        </div>
      )}

      {!subject && messages.length === 0 && (
        <div className="p-4">
          <p className="text-sm text-[var(--text-secondary)] mb-3">What subject do you need help with?</p>
          <div className="flex flex-wrap gap-2">
            {["Mathematics", "English", "Kiswahili", "Science", "Social Studies"].map((s) => (
              <button key={s} onClick={() => { setSubject(s); setMessages([{ role: "assistant", content: `Great! I'm ready to help you with ${s}. What would you like to learn?` }]); }} className="text-xs bg-[var(--surface-hover)] text-[var(--text-secondary)] px-3 py-1.5 rounded-full border border-border hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
            <div className="bg-[var(--background)] border border-border rounded-lg px-3 py-2 text-sm text-[var(--text-tertiary)] rounded-bl-sm">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2 bg-[var(--background)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={sessionError ? "Session ended" : "Ask Mwalimu..."}
          disabled={!!sessionError}
          className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[var(--border-strong)] transition-colors disabled:opacity-50"
        />
        <button type="submit" disabled={loading || !input.trim() || !!sessionError} className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary/90 transition disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
