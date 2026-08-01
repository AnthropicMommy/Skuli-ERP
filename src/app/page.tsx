"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useScrollParallax } from "@/hooks/use-scroll-parallax";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const parallaxOffset = useScrollParallax(0.15);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[--background]">
      {/* ─── Header ─── */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled ? "bg-[var(--background)]/90 backdrop-blur-md border-border" : "bg-transparent border-transparent"}`}>
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.5" />
              <path d="M9 18V12.5L14 9L19 12.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
              <path d="M12 18V14.5H16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
            </svg>
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">Skuli</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">
              Staff Login
            </Link>
            <Link href="/student-login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">
              Student Login
            </Link>
            <Link href="/portal/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">
              Parent Login
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-[var(--background)]/95 backdrop-blur-md">
            <div className="container py-4 space-y-2">
              <Link href="/student-login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
                Student Login
              </Link>
              <Link href="/portal/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
                Parent Login
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
                Staff Login
              </Link>
              <div className="pt-2 px-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="relative min-h-[80vh] sm:min-h-screen flex items-center pt-24 sm:pt-20 overflow-hidden">
          {/* Background grid with parallax */}
          <div
            className="absolute inset-0 grid-bg opacity-60"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          />
          {/* Radial accent glow */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(125, 211, 252, 0.06), transparent)",
            }}
          />

          <div className="container relative z-10">
            <ScrollReveal>
              <div className="max-w-3xl">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-[-0.02em] leading-[1.05] text-[var(--text-primary)]"
                  style={{ fontFamily: "Geist, Inter, sans-serif" }}
                >
                  Making Schools Great Again
                </h1>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
                  Assignments, learning resources, report cards, and parent communication — in one place. Built around the student. Free onboarding.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://cal.com/peter-makau-scales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] accent-glow"
                  >
                    Book a free demo
                  </a>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-[var(--border-strong)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-hover)] transition-all"
                  >
                    Explore features
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>

        {/* ─── Role Picker ─── */}
        <section id="roles" className="py-16 sm:py-24 lg:py-32 relative">
          <div className="container">
            <ScrollReveal>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.02em] text-[var(--text-primary)]"
                style={{ fontFamily: "Geist, Inter, sans-serif" }}
              >
                Make Learning Fun.
              </h2>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-4 mt-8 sm:mt-12 lg:mt-16">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  ),
                  title: "Student",
                  description: "View assignments, chat with classmates, get AI study help, and track your progress.",
                  cta: "Log in as Student",
                  href: "/student-login",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  ),
                  title: "Parent",
                  description: "Track attendance, view report cards, message teachers, and stay involved.",
                  cta: "Log in as Parent",
                  href: "/portal/login",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                    </svg>
                  ),
                  title: "Teacher",
                  description: "Manage classes, mark attendance, enter grades, and create assignments.",
                  cta: "Log in as Teacher",
                  href: "/login",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  ),
                  title: "Principal",
                  description: "Set up your school on Skuli. We handle onboarding and training — it's free.",
                  cta: "Book a free demo",
                  href: "https://cal.com/peter-makau-scales",
                  accent: true,
                },
              ].map((role, i) => (
                <ScrollReveal key={role.title} delay={60 * (i + 1)}>
                  <Link
                    href={role.href}
                    target={role.accent ? "_blank" : undefined}
                    rel={role.accent ? "noopener noreferrer" : undefined}
                    className="group block rounded-xl border border-border bg-[var(--surface)] p-5 sm:p-6 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background">
                        <span className={role.accent ? "text-primary" : "text-[var(--text-secondary)]"}>
                          {role.icon}
                        </span>
                      </div>
                      {role.accent && (
                        <span className="text-[10px] uppercase tracking-wider text-primary font-medium px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10">
                          Free
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                      {role.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                      {role.description}
                    </p>
                    <div
                      className={`inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium transition-all ${
                        role.accent
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {role.cta}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="py-16 sm:py-24 lg:py-32 relative border-t border-border">
          <div className="container">
            <ScrollReveal>
              <div className="eyebrow mb-4">Features</div>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.02em] text-[var(--text-primary)] max-w-2xl"
                style={{ fontFamily: "Geist, Inter, sans-serif" }}
              >
                Everything you need to run a school.
              </h2>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border mt-8 sm:mt-12 lg:mt-16">
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  ),
                  title: "Student Management",
                  description: "Enrollment, profiles, and academic history for every student.",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  ),
                  title: "CBC Grading",
                  description: "8-point rubric, term exams, and automated report cards.",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  ),
                  title: "Mwalimu AI",
                  description: "AI study assistant for students — revision help, quizzes, and homework support.",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  ),
                  title: "Class Chat",
                  description: "Real-time messaging between students, teachers, and parents.",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Attendance",
                  description: "Daily tracking, reports, and real-time parent notifications.",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  ),
                  title: "Timetable",
                  description: "Build, manage, and share class schedules in minutes.",
                },
              ].map((feature, i) => (
                <ScrollReveal key={feature.title} delay={60 * ((i % 3) + 1)}>
                  <div className="bg-[var(--surface)] p-5 sm:p-6 lg:p-8 transition-colors hover:bg-[var(--surface-hover)]">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background mb-4">
                      <span className="text-[var(--text-secondary)]">{feature.icon}</span>
                    </div>
                    <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden border-t border-border">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(125, 211, 252, 0.04), transparent)",
            }}
          />
          <div className="container relative z-10">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto text-center">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] leading-[1.1]"
                  style={{ fontFamily: "Geist, Inter, sans-serif" }}
                >
                  Ready to set up your school?
                </h2>
                <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
                  We handle onboarding and training. It&apos;s free.
                </p>
                <div className="mt-8">
                  <a
                    href="https://cal.com/peter-makau-scales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[0.98] active:scale-[0.97] accent-glow"
                  >
                    Book a free demo
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5" className="text-primary" opacity="0.5" />
                  <path d="M9 18V12.5L14 9L19 12.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                  <path d="M12 18V14.5H16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                </svg>
                <span className="text-[15px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">Skuli</span>
              </Link>
              <a
                href="mailto:info@skuli.co.ke"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                info@skuli.co.ke
              </a>
            </div>
            <div className="text-sm text-[var(--text-tertiary)]">
              &copy; 2026 Skuli
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
