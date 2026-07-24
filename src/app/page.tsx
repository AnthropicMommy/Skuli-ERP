import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
              <span className="text-lg font-semibold tracking-tight">Skuli</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-black/60 hover:text-black px-3 py-2 transition-colors">
                Staff Login
              </Link>
              <Link href="/student-login" className="text-sm font-medium text-black/60 hover:text-black px-3 py-2 transition-colors">
                Student Login
              </Link>
              <Link href="/portal/login" className="text-sm font-medium text-black/60 hover:text-black px-3 py-2 transition-colors">
                Parent Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight leading-[1.05]">
              The operating system for Kenyan schools
            </h1>
            <p className="text-lg text-black/50 mt-6 max-w-xl leading-relaxed">
              Attendance, grades, timetables, and parent communication — in one place.
              Built for CBC. Free onboarding.
            </p>
          </div>
        </div>
      </section>

      {/* Who are you? */}
      <section className="py-24 bg-white border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black tracking-tight">
              Who are you?
            </h2>
            <p className="text-black/50 mt-3 text-lg">
              Choose how you want to use Skuli.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Student */}
            <Link href="/student-login" className="group block bg-white border border-black/10 rounded-2xl p-6 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Student</h3>
              <p className="text-sm text-black/50 mt-2 leading-relaxed">
                View assignments, chat with classmates, get AI study help, and track your progress.
              </p>
              <div className="mt-4 text-sm font-medium text-cyan-600 group-hover:text-cyan-700">
                Log in as Student →
              </div>
            </Link>

            {/* Parent */}
            <Link href="/portal/login" className="group block bg-white border border-black/10 rounded-2xl p-6 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Parent</h3>
              <p className="text-sm text-black/50 mt-2 leading-relaxed">
                Track attendance, view report cards, message teachers, and stay involved.
              </p>
              <div className="mt-4 text-sm font-medium text-cyan-600 group-hover:text-cyan-700">
                Log in as Parent →
              </div>
            </Link>

            {/* Teacher */}
            <Link href="/login" className="group block bg-white border border-black/10 rounded-2xl p-6 hover:border-cyan-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Teacher</h3>
              <p className="text-sm text-black/50 mt-2 leading-relaxed">
                Manage classes, mark attendance, enter grades, and create assignments.
              </p>
              <div className="mt-4 text-sm font-medium text-cyan-600 group-hover:text-cyan-700">
                Log in as Teacher →
              </div>
            </Link>

            {/* Principal */}
            <Link href="https://cal.com/peter-makau-scales" target="_blank" rel="noopener noreferrer" className="group block bg-black text-white rounded-2xl p-6 hover:bg-black/90 transition-all">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Principal</h3>
              <p className="text-sm text-white/60 mt-2 leading-relaxed">
                Set up your school on Skuli. We handle onboarding and training — it&apos;s free.
              </p>
              <div className="mt-4 text-sm font-medium text-white/80 group-hover:text-white flex items-center gap-1">
                Book a free demo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl font-bold text-black tracking-tight">
              Everything you need to run a school.
            </h2>
            <p className="text-black/50 mt-3 text-lg">
              One platform. Every role. From enrollment to report cards.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5 rounded-2xl overflow-hidden">
            {[
              {
                title: "Student Management",
                desc: "Enrollment, profiles, and academic history for every student.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                ),
              },
              {
                title: "CBC Grading",
                desc: "8-point rubric, term exams, and automated report cards.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                ),
              },
              {
                title: "Mwalimu AI",
                desc: "AI study assistant for students — revision help, quizzes, and homework support.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                ),
              },
              {
                title: "Class Chat",
                desc: "Real-time messaging between students, teachers, and parents.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                ),
              },
              {
                title: "Attendance",
                desc: "Daily tracking, reports, and real-time parent notifications.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
              },
              {
                title: "Timetable",
                desc: "Build, manage, and share class schedules in minutes.",
                icon: (
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-6">
                <div className="text-black/40 mb-3">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-black">{feature.title}</h3>
                <p className="text-sm text-black/40 mt-1.5 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
              <span className="text-sm font-semibold">Skuli</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-black/30">
              <a href="mailto:info@skuli.co.ke" className="hover:text-black transition-colors">info@skuli.co.ke</a>
              <span>&copy; {new Date().getFullYear()} Skuli</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
