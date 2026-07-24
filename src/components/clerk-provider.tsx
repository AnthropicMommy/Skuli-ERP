"use client";

import { ClerkProvider as ClerkProviderBase } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProviderBase
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#0891b2",
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}
