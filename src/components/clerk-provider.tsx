"use client";

import { ClerkProvider as ClerkProviderBase } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProviderBase
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          card: "bg-[#111111] border border-[rgba(255,255,255,0.08)] shadow-none",
          formButtonPrimary: "bg-[#7DD3FC] hover:bg-[#7DD3FC]/90 text-[#0A0A0A] font-medium",
          socialButtonsBlockButton: "bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] hover:bg-[#1A1A1A]",
          socialButtonsBlockButtonText: "text-[#FAFAFA]",
          formFieldLabel: "text-[#FAFAFA]",
          formFieldInput: "bg-[#0A0A0A] border-[rgba(255,255,255,0.08)] text-[#FAFAFA]",
          headerTitle: "text-[#FAFAFA]",
          headerSubtitle: "text-[rgba(255,255,255,0.65)]",
          footerActionLink: "text-[#7DD3FC] hover:text-[#7DD3FC]/80",
          dividerLine: "bg-[rgba(255,255,255,0.08)]",
          dividerText: "text-[rgba(255,255,255,0.40)]",
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}
