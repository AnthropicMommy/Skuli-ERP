"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  { label: "What's my child's trip date?", icon: "🚌" },
  { label: "Can I get a progress update?", icon: "📊" },
  { label: "When is the next parent-teacher meeting?", icon: "📅" },
  { label: "What books should my child be reading?", icon: "📚" },
  { label: "How is my child's attendance?", icon: "✅" },
];

export default function PortalMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ id: string; title: string; message: string; createdAt: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [professionalNotice, setProfessionalNotice] = useState(true);

  useEffect(() => {
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    if (!token) { router.push("/portal/login"); return; }

    fetch("/api/parent/messages", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleSend(message: string) {
    setSending(true);
    const token = document.cookie.split("; ").find((c) => c.startsWith("skuli_token="))?.split("=")[1];
    const res = await fetch("/api/parent/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [data, ...prev]);
      setNewMessage("");
    }
    setSending(false);
  }

  if (loading) return <div className="text-center py-16"><div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">Messages</h1>
        <p className="text-xs text-black/40 mt-0.5">Send a message to your child&apos;s teacher</p>
      </div>

      {professionalNotice && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-cyan-800">
            💬 Keep conversations professional and focused on your child&apos;s education. Use the quick actions below for common questions.
          </p>
          <button onClick={() => setProfessionalNotice(false)} className="text-xs text-cyan-600 mt-2 underline">Got it</button>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-medium text-black/40 mb-2">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.label)}
              disabled={sending}
              className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-black/70 hover:border-black/20 transition disabled:opacity-50"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={(e) => { e.preventDefault(); if (newMessage.trim()) handleSend(newMessage); }} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <button type="submit" disabled={sending || !newMessage.trim()} className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/80 transition disabled:opacity-50">
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-black/40 text-center py-8">No messages yet. Use the quick actions above to send your first message.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-black/40 mb-1">{msg.title}</p>
              <p className="text-sm text-black">{msg.message}</p>
              <p className="text-xs text-black/30 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
