import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--surface)] border border-border rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-[var(--text-primary)]">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Page not found</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/student"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[var(--surface)] text-[var(--text-secondary)] border border-border px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--surface-hover)] transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
