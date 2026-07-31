"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: string;
  content: string;
  createdAt: string;
}

export default function StudentClassPage() {
  const params = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [studyReminder, setStudyReminder] = useState(false);
  const [myId, setMyId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMyId(payload.studentId || "");
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  function fetchMessages() {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) return;
    fetch(`/api/classes/${params.id}/chat`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending || cooldown > 0) return;
    setSending(true);
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    const res = await fetch(`/api/classes/${params.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: newMessage }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.studyReminder) {
        setStudyReminder(true);
      } else if (data.id) {
        setMessages((prev) => [...prev, data]);
        setStudyReminder(false);
      }
      setNewMessage("");
      setCooldown(60);
    } else if (res.status === 429) {
      const data = await res.json();
      const match = data.error?.match(/(\d+)/);
      if (match) setCooldown(parseInt(match[1]));
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === myId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${msg.senderId === myId ? "bg-primary text-[#0A0A0A]" : msg.senderType === "system" ? "bg-primary/10 text-primary border border-primary/20" : "bg-[var(--surface-hover)] text-[var(--text-primary)] border border-border"}`}>
              {msg.senderId !== myId && msg.senderType !== "system" && (
                <p className="text-xs font-medium opacity-60 mb-0.5">{msg.senderName}</p>
              )}
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {studyReminder && (
        <div className="mx-4 mb-2 bg-[var(--rubric-ae)]/10 border border-[var(--rubric-ae)]/20 rounded-lg px-4 py-2 text-sm text-[var(--rubric-ae)]">
          📚 Time to focus on your studies! Consider picking up a book.
          <button onClick={() => setStudyReminder(false)} className="ml-2 underline text-xs">dismiss</button>
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Type a message..."}
          disabled={cooldown > 0}
          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[var(--border-strong)] disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={sending || cooldown > 0 || !newMessage.trim()}
          className="bg-primary text-[#0A0A0A] text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
