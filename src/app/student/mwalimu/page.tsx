"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

function MwalimuContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [classId, setClassId] = useState("");
  const [isIndependent, setIsIndependent] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionError, setSessionError] = useState("");
  const [revisionId, setRevisionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let token = "";
    try {
      const cookie = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="));
      if (cookie) {
        token = cookie.split("=")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.classId) setClassId(payload.classId);
        if (payload.isIndependent) setIsIndependent(true);
        console.log("[mwalimu] JWT payload:", payload);
      }
    } catch (e) {
      console.error("[mwalimu] Failed to parse JWT:", e);
    }

    // Load chat history from DB
    (async () => {
      try {
        const match = document.cookie.match(/skuli_token=([^;]+)/);
        const authToken = match?.[1];
        if (!authToken) {
          console.warn("[mwalimu] No skuli_token cookie found");
          return;
        }

        // Debug: check DB state
        const debugRes = await fetch("/api/mwalimu/history?debug=1", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const debugData = await debugRes.json();
        console.log("[mwalimu] DB diagnostic:", debugData);

        // Load actual history
        const res = await fetch("/api/mwalimu/history?limit=50", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        console.log("[mwalimu] History response:", data);
        if (data.messages?.length > 0) {
          const loaded = data.messages
            .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
            .map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }));
          if (loaded.length > 0) {
            setMessages(loaded);
            const lastSubject = data.messages[data.messages.length - 1]?.subject;
            if (lastSubject && lastSubject !== "general") setSubject(lastSubject);
          }
        }
      } catch (err) {
        console.error("[mwalimu] Failed to load chat history:", err);
      }
    })();
  }, []);

  useEffect(() => {
    // Check sessionStorage first (from test revision)
    try {
      const storedRevision = sessionStorage.getItem("mwalimu_revisionId");
      if (storedRevision) {
        sessionStorage.removeItem("mwalimu_revisionId");
        setRevisionId(storedRevision);
      }
      const stored = sessionStorage.getItem("mwalimu_prefill");
      if (stored) {
        sessionStorage.removeItem("mwalimu_prefill");
        setInput(stored);
        return;
      }
    } catch {}
    // Fallback to URL param
    const prefill = searchParams.get("prefill");
    if (prefill) {
      setInput(prefill);
    }
  }, [searchParams]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setSessionError("");

    const token = (() => {
      try {
        const match = document.cookie.match(/skuli_token=([^;]+)/);
        return match?.[1] || null;
      } catch { return null; }
    })();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch("/api/mwalimu", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          message: userMsg,
          subject: subject || undefined,
          classId: classId || undefined,
          revisionId: revisionId || undefined,
          conversationHistory: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
        credentials: "same-origin",
      });
      clearTimeout(timeout);

      let data;
      try {
        data = await res.json();
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Server returned an invalid response. Please try again." }]);
        setLoading(false);
        return;
      }

      console.log("[mwalimu] POST response:", { ok: res.ok, status: res.status, hasReply: !!data.reply, error: data.error });

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.session) setSession(data.session);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "Something went wrong. Please try again." }]);
      }
    } catch (err) {
      const msg = err instanceof Error && err.name === "AbortError"
        ? "Request timed out. Mwalimu is thinking hard — try a shorter message."
        : "Network error. Check your connection and try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mwalimu AI</h1>
          <p className="text-[var(--text-secondary)] mt-1.5">Your personal CBC learning assistant</p>
        </div>
        <Link
          href="/student/mwalimu/test"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-primary/90 transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Generate Test
        </Link>
      </div>

      {!subject && messages.length === 0 && !searchParams.get("prefill") && (
        <div className="bg-[var(--surface)] border border-border rounded-xl p-6 mb-6">
          <p className="text-sm text-[var(--text-secondary)] mb-4">What subject do you need help with?</p>
          <div className="flex flex-wrap gap-2.5">
            {["Mathematics", "English", "Kiswahili", "Science", "Social Studies"].map((s) => (
              <button key={s} onClick={() => { setSubject(s); setMessages([{ role: "assistant", content: `Great! I'm ready to help you with ${s}. What would you like to learn?` }]); }} className="text-xs bg-[var(--background)] text-[var(--text-secondary)] px-4 py-2.5 rounded-lg border border-border hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {isIndependent && session && (
        <div className="text-xs text-[var(--text-tertiary)] mb-4">Free unlimited sessions — learn as much as you want</div>
      )}

      <div className="flex-1 overflow-y-auto space-y-5 mb-6 px-1">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-base font-medium text-[var(--text-primary)]">Ask Mwalimu anything</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1.5">Pick a subject above or just start typing</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[var(--text-primary)] text-[var(--background)] rounded-br-md"
                : "bg-[var(--surface)] text-[var(--text-primary)] border border-border rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface)] border border-border rounded-2xl rounded-bl-md px-5 py-3 text-sm text-[var(--text-tertiary)]">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={sessionError ? "Session ended" : "Ask Mwalimu..."}
          disabled={!!sessionError}
          className="flex-1 px-5 py-3.5 border border-border rounded-xl text-sm bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
        />
        <button type="submit" disabled={loading || !input.trim() || !!sessionError} className="bg-primary text-[#0A0A0A] font-medium px-6 py-3.5 rounded-xl hover:bg-primary/90 transition disabled:opacity-50 text-sm">
          Send
        </button>
      </form>
    </div>
  );
}

export default function MwalimuPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <MwalimuContent />
    </Suspense>
  );
}
