"use client";

import { useEffect, useState } from "react";

interface MwalimuCharacterProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
}

export function MwalimuCharacter({ size = "md", message, className = "" }: MwalimuCharacterProps) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const sizes = {
    sm: { container: "w-20 h-24", head: "w-12 h-12", body: "w-10 h-8", scale: 0.6 },
    md: { container: "w-32 h-40", head: "w-20 h-20", body: "w-16 h-12", scale: 1 },
    lg: { container: "w-48 h-56", head: "w-28 h-28", body: "w-22 h-16", scale: 1.5 },
    xl: { container: "w-64 h-72", head: "w-36 h-36", body: "w-28 h-20", scale: 2 },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {message && (
        <div className="mb-3 px-4 py-2 bg-[var(--surface)] border border-border rounded-xl text-xs text-[var(--text-secondary)] text-center max-w-[200px] relative">
          {message}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--surface)] border-b border-r border-border rotate-45" />
        </div>
      )}

      <div className={`${s.container} relative`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse" />

        {/* Character body group */}
        <div className="absolute inset-0 flex flex-col items-center justify-end">
          {/* Body */}
          <div className="relative">
            {/* Torso */}
            <div className={`${s.body} bg-primary/20 rounded-t-xl border border-primary/30 relative mx-auto`}>
              {/* Tie/collar detail */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-primary rounded-b-sm" />
              {/* Pocket */}
              <div className="absolute bottom-1 right-1 w-2 h-2 border border-primary/40 rounded-sm" />
            </div>

            {/* Arms */}
            <div className="absolute top-1 -left-4 w-4 h-8 bg-primary/15 rounded-full border border-primary/25 -rotate-12 origin-top" />
            <div className="absolute top-1 -right-4 w-4 h-8 bg-primary/15 rounded-full border border-primary/25 rotate-12 origin-top" />

            {/* Hands */}
            <div className="absolute top-7 -left-5 w-3 h-3 bg-[#C8956C] rounded-full border border-[#B8855C]" />
            <div className="absolute top-7 -right-5 w-3 h-3 bg-[#C8956C] rounded-full border border-[#B8855C]" />
          </div>

            {/* Head group with float animation */}
            <div className="absolute -top-2 left-1/2" style={{ transform: "translateX(-50%)", animation: "mwalimu-float 3s ease-in-out infinite" }}>
            {/* Graduation cap */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="w-14 h-2 bg-[#1a1a1a] rounded-sm border border-[#333] relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#1a1a1a] rounded-t-sm border border-[#333] border-b-0" />
                {/* Tassel */}
                <div className="absolute -top-1 -right-3 w-0.5 h-4 bg-primary rounded-full" style={{ animation: "mwalimu-tassel 2s ease-in-out infinite" }} />
                <div className="absolute top-2.5 -right-4 w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
            </div>

            {/* Head */}
            <div className={`${s.head} bg-[#C8956C] rounded-full border-2 border-[#B8855C] relative`}>
              {/* Hair line */}
              <div className="absolute top-0.5 left-2 right-2 h-2 bg-[#1a1a1a] rounded-b-lg" />

              {/* Eyes */}
              <div className="absolute top-1/3 left-0 right-0 flex justify-center gap-3">
                {/* Left eye */}
                <div className="relative">
                  <div className={`w-2.5 h-2.5 bg-[#1a1a1a] rounded-full transition-all duration-100 ${blinking ? "scale-y-[0.1]" : ""}`}>
                    <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>
                {/* Right eye */}
                <div className="relative">
                  <div className={`w-2.5 h-2.5 bg-[#1a1a1a] rounded-full transition-all duration-100 ${blinking ? "scale-y-[0.1]" : ""}`}>
                    <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Glasses */}
              <div className="absolute top-[28%] left-0 right-0 flex justify-center gap-0.5">
                <div className="w-4 h-3.5 border border-[#8B7355] rounded-md bg-transparent" />
                <div className="w-1.5 h-0.5 border-b border-[#8B7355] mt-1.5" />
                <div className="w-4 h-3.5 border border-[#8B7355] rounded-md bg-transparent" />
              </div>

              {/* Nose */}
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#B8855C] rounded-full" />

              {/* Smile */}
              <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-[#8B5E3C] rounded-b-full" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mwalimu-float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes mwalimu-tassel {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
      `}</style>
    </div>
  );
}
