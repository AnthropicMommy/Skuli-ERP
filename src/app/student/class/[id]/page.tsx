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
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${msg.senderId === myId ? "bg-black text-white" : msg.senderType === "system" ? "bg-cyan-50 text-cyan-800 border border-cyan-200" : "bg-slate-100 text-black"}`}>
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
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
          📚 Time to focus on your studies! Consider picking up a book.
          <button onClick={() => setStudyReminder(false)} className="ml-2 underline text-xs">dismiss</button>
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-slate-200 p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Type a message..."}
          disabled={cooldown > 0}
          className="flex-1 px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || cooldown > 0 || !newMessage.trim()}
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
