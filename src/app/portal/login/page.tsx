import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function ParentLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Skuli</span>
          </Link>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Parent sign in</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">View your child&apos;s progress and report cards.</p>
        </div>

        <SignIn
          routing="path"
          path="/portal/login"
          signUpUrl="/portal/signup"
          fallbackRedirectUrl="/portal"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[var(--surface)] border border-border shadow-none",
              headerTitle: "text-[var(--text-primary)]",
              headerSubtitle: "text-[var(--text-tertiary)]",
              socialButtonsBlockButton: "bg-[var(--background)] border border-border text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
              socialButtonsBlockButtonText: "text-[var(--text-primary)]",
              formFieldLabel: "text-[var(--text-primary)]",
              formFieldInput: "bg-[var(--background)] border-border text-[var(--text-primary)]",
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] block transition-colors">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
