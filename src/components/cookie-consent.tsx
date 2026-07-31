"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("skuli_cookie_consent");
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("skuli_cookie_consent", "accepted");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="container max-w-2xl bg-[var(--surface)] border border-border rounded-xl p-4 flex items-center justify-between gap-4 shadow-lg">
        <p className="text-sm text-[var(--text-secondary)]">
          We use cookies to keep you signed in and improve your experience. No tracking, no ads. Just a better Skuli.
        </p>
        <button onClick={accept} className="shrink-0 bg-primary text-[#0A0A0A] px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition">
          Accept
        </button>
      </div>
    </div>
  );
}
