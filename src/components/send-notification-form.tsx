"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SendNotificationForm({ schoolId }: { schoolId: string }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, title, message, phone }),
    });

    if (res.ok) {
      setSent(true);
      setTitle("");
      setMessage("");
      setPhone("");
      setTimeout(() => setSent(false), 3000);
    }
    setSending(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Send SMS Notification</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Attendance Alert" required />
          </div>
          <div>
            <Label>Recipient Phone</Label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254712345678" required />
          </div>
        </div>
        <div>
          <Label>Message</Label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[80px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your SMS message here..."
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send SMS"}
          </Button>
          {sent && <span className="text-sm text-green-600 font-medium">Notification sent! (stub — no real SMS)</span>}
        </div>
        <p className="text-xs text-gray-400">
          This is a stub. In production, this would send via Africa&apos;s Talking or Twilio SMS API.
        </p>
      </form>
    </div>
  );
}
