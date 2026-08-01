# Skuli ERP — Engineering Handoff

> Multi-tenant school management platform for Kenyan CBC schools (Grades 1–12) with an independent student access model.
> Revenue: B2B (schools pay). Students and parents always free.

---

## 1. What Skuli Is

- **School Management:** Staff use Clerk Organizations for auth. Each school is a Clerk org with isolated data.
- **Independent Students:** Free accounts via custom JWT auth. Can access Mwalimu AI tutor, revision papers, and the library.
- **Parent Portal:** Clerk-based auth for parents to view their child's report cards, attendance, assignments.
- **Mwalimu AI:** AI learning assistant. Generates tests, grades them, stores results for revision. 4-provider fallback chain (Gemini → Groq → NVIDIA Super → NVIDIA Nano).
- **CBC Library:** 209 real scraped curriculum materials (PDFs) from teacher.co.ke and freeexams.co.ke, served via Vercel Blob.

---

## 2. Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4, dark-mode-first |
| Auth (staff) | Clerk Organizations |
| Auth (students/parents) | Custom JWT in `skuli_token` cookie |
| Database | Neon Postgres + Prisma ORM |
| File Storage | Vercel Blob |
| AI | Groq Llama 3.3 70B, Gemini 2.0 Flash, NVIDIA Nemotron Super 49B, NVIDIA Nemotron Mini 4B |
| Deploy | Vercel (manual: `vercel --yes --prod`) |

---

## 3. Environment Variables

All keys are in `.env` at project root. **Never commit this file.**

```env
# ─── Database (Neon Postgres) ───────────────────────────────
DATABASE_URL="postgresql://neondb_owner:npg_GlHQgVeYL75b@ep-small-math-aun65hb7-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require"

# ─── Clerk Authentication ───────────────────────────────────
# Frontend (publishable): pk_test_...
# Frontend dashboard: https://joint-grouper-68.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ─── Groq (primary AI for Mwalimu) ─────────────────────────
GROQ_API_KEY=gsk_...

# ─── NVIDIA Build API (4 keys, round-robin, 40 RPM each) ───
# Expiry: 12 months from creation
# Best models: nvidia/llama-3.3-nemotron-super-49b-v1.5 (quality)
#              nvidia/nemotron-mini-4b-instruct (fast fallback)
NVIDIA_API_KEY_1=nvapi-...
NVIDIA_API_KEY_2=nvapi-...
NVIDIA_API_KEY_3=nvapi-...
NVIDIA_API_KEY_4=nvapi-...

# ─── JWT (student/parent custom auth) ───────────────────────
JWT_SECRET=skuli-pilot-jwt-secret-2026

# ─── Vercel Blob ────────────────────────────────────────────
BLOB_STORE_ID="store_..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
# CRITICAL: Blob SDK requires explicit `token` in put() — env auto-detection doesn't work outside Vercel.

# ─── Email ──────────────────────────────────────────────────
RESEND_API_KEY=re_...

# ─── App ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://skuli.vercel.app
```

### AI Provider Limits

| Provider | Model | Rate Limit | Max Tokens (output) |
|----------|-------|------------|---------------------|
| Groq | llama-3.3-70b-versatile | Free tier: 30 RPM | 4096 |
| Gemini | gemini-2.0-flash | Free tier: 15 RPM | 4096 |
| NVIDIA | nemotron-super-49b-v1.5 | 40 RPM per key (×4 = 160 RPM) | 4096 |
| NVIDIA | nemotron-mini-4b-instruct | 40 RPM per key (×4 = 160 RPM) | 4096 |

Fallback chain: Gemini → Groq → NVIDIA Super → NVIDIA Nano. Each provider is tried; if it fails, move to next.

**Missing key:** `GEMINI_API_KEY` is not in `.env`. Gemini provider is skipped. If you want Gemini, add the key to `.env` AND to Vercel env vars.

---

## 4. Deployment

### Vercel Project
- **Team:** petervfk1-6392s-projects
- **Project:** skulix
- **Production URL:** https://skulix.vercel.app
- **Deploy command:** `vercel --yes --prod`
- **Auto-deploy from GitHub is BROKEN** — must deploy manually.

### Deploy Steps
```bash
# 1. Generate Prisma client (build script does this, but just in case)
npx prisma generate

# 2. Deploy
vercel --yes --prod
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name <migration-name>

# Deploy to production
npx prisma migrate deploy
```

**Important:** `db push` works locally but NOT for production. Use `migrate deploy` for production.

---

## 5. Auth System (Dual)

### Staff/School-Enrolled Students → Clerk
- Middleware protects all routes except those in `isPublicRoute` list
- Staff and school-enrolled students use Clerk Organizations
- Each school = one Clerk org

### Independent Students/Parents → Custom JWT
- JWT stored in `skuli_token` cookie
- Token payload: `{ studentId, schoolId, grade, name, isIndependent, classId? }`
- `getTokenFromRequest()` checks `Authorization: Bearer <token>` header FIRST, then falls back to Cookie
- Cookie must include `SameSite=Lax` for iPad Safari

### Auth Routes
| Route | Purpose |
|-------|---------|
| `/student-login` | Main student login page (Clerk for school-enrolled) |
| `/student-login/independent` | Independent student login (custom JWT) |
| `/student-login/independent/signup` | Independent student signup |
| `/student-login/independent/onboarding` | Onboarding quiz for independent students |
| `/portal/login` | Parent login (Clerk) |
| `/portal/signup` | Parent signup (Clerk) |

---

## 6. Design System

**Theme: "Quiet Precision"** — dark-mode-first, minimal, no blue-gray hover tinting.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0A0A0A` | Page background |
| `--surface` | `#111111` | Cards, inputs |
| `--accent` | `#7DD3FC` | Links, active states, focus rings |
| `--text-primary` | `#FFFFFF` | Headings, body |
| `--text-secondary` | `#A0A0A0` | Descriptions |
| `--text-tertiary` | `#666666` | Hints, timestamps |
| `--border` | `#222222` | Card borders, dividers |
| Primary (Clerk) | `#0A0A0A` | Buttons (black on white) |

**Rules:**
- Hover states: cyan border (`border-[var(--accent)]`), NOT blue-gray background tint
- Text on hover stays white — do NOT add `group-hover:text-[var(--accent)]`
- Buttons: black bg (`#0A0A0A`) with white text, or cyan accent for primary actions
- All `fetch()` calls must have `try/catch` — tablets on slow connections fail silently

---

## 7. Database Schema (33 Models)

Key models for independent students:

| Model | Table | Purpose |
|-------|-------|---------|
| `Student` | `students` | All students (school + independent) |
| `StudentProfile` | `student_profiles` | Independent student onboarding data |
| `MwalimuSession` | `mwalimu_sessions` | AI session token tracking |
| `MwalimuMessage` | `mwalimu_messages` | Chat history |
| `TestRevision` | `test_revisions` | Saved test results for AI revision |
| `SourceMaterial` | `source_materials` | Library PDFs metadata |
| `RevisionPaper` | `revision_papers` | Past exam papers |
| `StudyTimetable` | `study_timetables` | Student study schedules |

**Special school:** `skuli-open-learning` — auto-created for independent students.

---

## 8. Project Structure

```
src/
├── app/
│   ├── api/                          # 26 API route groups
│   │   ├── auth/                     # Login/signup JWT endpoints
│   │   ├── mwalimu/                  # AI chat + test generation/grading
│   │   ├── test-revision/            # Save test results for revision
│   │   └── ...
│   ├── student/                      # Student dashboard (JWT auth)
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── library/page.tsx          # CBC materials (server component)
│   │   ├── library/view/[id]/        # In-app PDF viewer
│   │   ├── mwalimu/page.tsx          # AI chat
│   │   ├── mwalimu/test/             # AI test generator
│   │   ├── assignments/              # Homework
│   │   ├── announcements/            # School announcements
│   │   ├── revision-papers/          # Past papers
│   │   ├── study-timetable/          # Study planner
│   │   └── timetable/                # Class timetable
│   ├── student-login/                # Student auth pages
│   │   ├── independent/              # Independent student login
│   │   │   ├── signup/               # Signup with onboarding
│   │   │   └── onboarding/           # Quiz for profile
│   │   └── page.tsx                  # Main login
│   ├── portal/                       # Parent portal (Clerk auth)
│   │   ├── page.tsx                  # Parent dashboard
│   │   ├── assignments/
│   │   ├── attendance/
│   │   └── messages/
│   ├── (dashboard)/                  # School staff dashboard (Clerk)
│   └── report/[studentId]/           # Public report cards
├── lib/
│   ├── ai-providers.ts              # Shared AI provider chain
│   ├── auth.ts                       # JWT sign/verify, getTokenFromRequest
│   ├── prisma.ts                     # Prisma client (uses PrismaPg adapter)
│   └── cbc.ts                        # CBC curriculum data
├── components/                       # Shared React components
├── generated/prisma/                 # Prisma generated client
└── middleware.ts                     # Clerk middleware + public routes
```

---

## 9. Known Bugs & Active Issues

### CRITICAL: Mwalimu Revision Crash
**Symptom:** Student completes test → clicks "Revise with Mwalimu" → first message returns "Something went wrong" (500).
**Root cause:** Likely the revision context (all wrong questions with explanations) makes the system prompt too large, causing all AI providers to fail. Or the `testRevision` Prisma model may not be in the deployed client.
**Files:** `/src/app/api/mwalimu/route.ts` (lines 274–298), `/src/app/api/test-revision/route.ts`
**Fix needed:**
1. Limit revision context to max 10 wrong questions
2. Make revision context more compact (no explanations, just Q&A)
3. Verify Prisma client is regenerated before deploy

### Test Generation Sometimes Fails
**Symptom:** "Failed to generate test. Please try again."
**Root cause:** AI providers may be slow/down, or prompt too verbose.
**File:** `/src/app/api/mwalimu/test/route.ts`
**Fix needed:** Add timeout per-provider, reduce prompt further.

### Vercel Auto-Deploy Broken
GitHub pushes don't trigger Vercel builds. Must use `vercel --yes --prod` manually.

### Cannot Access Vercel Logs
No `vercel logs` CLI access. Must infer errors from API responses.

### Missing Gemini API Key
`GEMINI_API_KEY` is not in `.env`. Gemini provider is skipped in the fallback chain.

---

## 10. What Needs to Be Done Next

### Priority 1 — Fix Mwalimu Revision (BLOCKING)
1. Read `/src/app/api/mwalimu/route.ts` lines 274–298
2. Limit `wrongQs` to first 10 questions max
3. Simplify the revision context string (shorter, no explanations)
4. Regenerate Prisma client: `npx prisma generate`
5. Deploy: `vercel --yes --prod`
6. Test: take a test → click "Revise with Mwalimu" → send first message

### Priority 2 — Fix Test Generation Reliability
1. Read `/src/app/api/mwalimu/test/route.ts`
2. Add 15-second timeout per provider (AbortController)
3. Shorten the test generation prompt if needed

### Priority 3 — Student Section Polish
- Test all student pages end-to-end on tablet/iPad
- Verify PWA works (manifest.json, icons, viewport)
- Check all empty states have CTAs
- Verify library PDF viewer works on mobile

### Priority 4 — Parent Section
- Build out parent dashboard features (report cards, attendance, assignments, messages)
- Parent portal currently has basic pages — wire them to real data

### Priority 5 — Infrastructure
- Get `GEMINI_API_KEY` for Gemini fallback
- Fix Vercel auto-deploy (or accept manual deploys)
- Get `vercel logs` access for debugging

---

## 11. Testing Checklist

- [ ] Independent signup → login → onboarding → library → mwalimu chat
- [ ] Take test → submit → see results → "Revise with Mwalimu" → send message (no 500)
- [ ] Library: browse grade tabs → click material → PDF viewer opens → download works
- [ ] All `fetch()` calls have `try/catch` (check tablet/slow connection behavior)
- [ ] Parent portal: login → dashboard → assignments → attendance → messages
- [ ] PWA: add to home screen on iPhone/Android → opens in standalone mode
- [ ] iPad Safari: cookies work (`SameSite=Lax`), no infinite redirects

---

## 12. File Locations for Key Features

| Feature | Files |
|---------|-------|
| AI Chat | `src/app/api/mwalimu/route.ts`, `src/app/student/mwalimu/page.tsx` |
| AI Test Gen | `src/app/api/mwalimu/test/route.ts`, `src/app/student/mwalimu/test/page.tsx` |
| Test Revision | `src/app/api/test-revision/route.ts` |
| Library | `src/app/student/library/page.tsx`, `src/components/library-content.tsx` |
| PDF Viewer | `src/app/student/library/view/[id]/page.tsx`, `src/components/material-viewer.tsx` |
| Independent Auth | `src/app/api/auth/student/independent-signup/route.ts`, `src/app/api/auth/student/independent-login/route.ts` |
| JWT Auth | `src/lib/auth.ts` |
| AI Providers | `src/lib/ai-providers.ts` |
| Prisma Client | `src/lib/prisma.ts` |
| Schema | `prisma/schema.prisma` |
| Middleware | `src/middleware.ts` |
| PWA | `public/manifest.json`, `public/icon-192.png`, `public/icon-512.png` |
| Parent Portal | `src/app/portal/page.tsx`, `src/app/portal/layout.tsx` |
