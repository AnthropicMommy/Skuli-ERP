"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MwalimuChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];

    try {
      const res = await fetch("/api/mwalimu", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: userMsg,
          subject: subject || undefined,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {}

    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-black/80 transition z-50"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.105V4.875A2.25 2.25 0 016 2.625h12A2.25 2.25 0 0120.25 4.875v10.5A2.25 2.25 0 0118 17.625H6.75a.75.75 0 00-.75.75v1.5" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Mwalimu</p>
            <p className="text-xs text-black/40">AI Learning Assistant</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-black/40 hover:text-black/60">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!subject && messages.length === 0 && (
        <div className="p-4">
          <p className="text-sm text-black/60 mb-3">What subject do you need help with?</p>
          <div className="flex flex-wrap gap-2">
            {["Mathematics", "English", "Kiswahili", "Science", "Social Studies"].map((s) => (
              <button key={s} onClick={() => { setSubject(s); setMessages([{ role: "assistant", content: `Great! I'm ready to help you with ${s}. What would you like to learn?` }]); }} className="text-xs bg-slate-100 text-black/70 px-3 py-1.5 rounded-full hover:bg-slate-200 transition">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-black text-white" : "bg-slate-100 text-black"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg px-3 py-2 text-sm text-black/40">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-slate-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Mwalimu..."
          className="flex-1 px-3 py-1.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
