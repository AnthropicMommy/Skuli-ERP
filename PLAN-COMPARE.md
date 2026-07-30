# Skuli Kenya — Codebase vs Plan Comparison Report

> **Date:** 2026-07-28
> **Purpose:** What's built, what's not, what conflicts, and the build order recommendation
> **Key decision from Peter:** NO fee locking. Schools are the customers. Parents and students are the users — help them freely. Revenue comes from selling to schools, not gating parents out of report cards.

---

## 1. BUILT & WORKING

These features match the plan and are functional:

### 1.1 Multi-Tenant Architecture (via Clerk)
- **Status:** ✅ Built, works
- **How:** Each school is a `School` record with `clerkOrgId`. Staff authenticate via Clerk. Queries scope by `schoolId` derived from the staff record.
- **Note:** Multi-tenancy is `schoolId`-based, NOT Clerk Organizations-based. The `clerkOrgId` field exists but most routes don't use it directly. This is fine for pilot — the data isolation works. Not a conflict, just different implementation.

### 1.2 CBC Report Cards (rubric-based assessment)
- **Status:** ✅ Built and working
- **What exists:**
  - 8-point rubric scale (EE1 through BE2) — color-coded, full CBC compliance
  - 7 Core Competencies tracked per student per term
  - Subject lists for Lower Primary (Grades 1-3) and Upper Primary (Grades 4-6) — all CBC subjects including Kiswahili/KSL, Environmental Activities, Movement & Creative Activities, etc.
  - `POST /api/cbc` — upserts rubric results
  - Grading Form component (`/components/grading-form.tsx`) — teacher selects grade/subject/term, sees all students, clicks rubric level to grade
  - Printable Report Card component (`/components/report-card.tsx`) — school header, student info, subject results, competency scores, average points
  - Public report viewer at `/report/[studentId]` — no auth required, parents can view directly
  - Reports dashboard at `/dashboard/reports` — staff sees all students grouped by grade
- **CBC Subjects covered:**
  - Lower Primary: Literacy, Indigenous Language, Kiswahili/KSL, English, Mathematics, Environmental Activities, Religious Education, Movement & Creative Activities
  - Upper Primary: English, Kiswahili/KSL, Mathematics, Science & Technology, Social Studies, Agriculture & Nutrition, Religious Education, Creative Arts, Physical & Health Education, Home Science
- **Verdict:** This is the strongest feature. Fully implemented and demo-ready.

### 1.3 Fee Balance Locking — REMOVED FROM PLAN
- **Status:** ❌ NOT NEEDED — Peter explicitly does not want this
- **Reason:** The business model is B2B (sell to schools), not B2C (charge parents). Parents and students should have full access to report cards, attendance, etc. without fee gates. Revenue comes from school subscriptions, not parent payments.
- **Action:** Do not build fee locking. The current codebase has no fee model or payment system — this is the correct state. Leave it as-is.

### 1.4 Teacher Dashboard
- **Status:** ✅ Built and working
- **Pages:** Dashboard overview, Students, Staff, Classes, Class Detail, Attendance, Exams & Grading, CBC Grading, Timetable, Assignments, Library, Notifications, Reports, Analytics, Settings, Claim Class
- **Components:** Grading Form, Attendance Grid, Assignments List, Exams List, Dashboard Charts, Staff Table, Students Table, Timetable View, Send Notification Form
- **Analytics:** Recharts-based — attendance distribution, grade distribution, rubric distribution, staff by role
- **Role-based sidebar:** Dynamic based on `SchoolRole` (21 roles defined)

### 1.5 Parent Portal
- **Status:** ✅ Built and working
- **Pages:** Login, Signup, Dashboard, Report Card, Attendance, Assignments, Messages
- **Auth:** Custom JWT (not Clerk) — parents authenticate independently
- **Note:** No fee gating on report cards (as intended)

### 1.6 Student Portal
- **Status:** ✅ Built and working
- **Pages:** Dashboard, Library, Announcements, Assignments, Attendance, Messages
- **Auth:** Custom JWT — students authenticate by admission number

### 1.7 Class Chat (existing)
- **Status:** ✅ Built and working
- **What exists:** Real-time class chat with SSE streaming, cooldown (60s between messages), 15-message limit per 5-hour window
- **Models:** `ChatMessage`, `ChatCooldown`
- **API:** `/api/classes/[id]/chat` (GET/POST), `/api/classes/[id]/chat/stream` (SSE)
- **Note:** This is bidirectional student messaging. The plan says "NOT a live chat / not bidirectional student messaging" — but it already exists. Keep it for now, but be aware it conflicts with the plan's safeguarding stance. Could be toggled off or limited by role if needed.

---

## 2. BUILT BUT INCOMPLETE

These exist in the codebase but are missing critical pieces:

### 2.1 Study Materials (model exists, no UI or API)
- **Status:** ⚠️ Schema only — no routes, no pages
- **What exists:** `StudyMaterial` model in Prisma schema with fields: title, description, subject, grade, type (document/ebook/video/link), fileUrl, externalUrl
- **What's missing:**
  - No API routes for CRUD operations
  - No upload mechanism (fileUrl is just a string field)
  - No teacher UI to create/manage materials
  - No student UI to browse/download materials
  - No org-level scoping in the model (no `organizationId` field — needs migration)
  - No class-level filtering
- **Verdict:** Needs to be rebuilt from scratch as "School Library" per the plan. The model is a starting point but needs `organizationId` and `classId` fields added.

### 2.2 Library Book Management (physical books only)
- **Status:** ⚠️ Built for physical books, not digital revision materials
- **What exists:** `LibraryBook` (physical book catalog), `LibraryTransaction` (issue/return), add book form, issue/return flow, student browsing
- **What's missing for plan:** The plan wants digital file uploads (PDFs, worksheets, past papers), not physical book tracking. The existing library is a different use case.
- **Verdict:** Keep existing physical library as-is. Build the new "School Library" (digital materials) as a separate feature alongside it. The `LibraryDashboard` component could be extended to include a "Study Materials" tab.

### 2.3 Announcements (model exists, no creation UI)
- **Status:** ⚠️ Student-facing page exists, no staff creation interface
- **What exists:** `Announcement` model (title, content, priority, targetRole, authorId, authorName), student announcements page at `/student/announcements`
- **What's missing:**
  - No staff-facing announcement creation form
  - No API route for creating announcements
  - No class-scoping (current model is school-wide only)
  - No `classId` field — the plan wants class-level announcements
- **Verdict:** Needs a creation form + API route + class-scoping. Low priority per plan.

### 2.4 Assignments (partial — creation works, submission partially works)
- **Status:** ⚠️ Teacher can create, student submission UI incomplete
- **What exists:** `Assignment` model with fileUrl (unused), `AssignmentSubmission` model, creation API, student listing
- **What's missing:** File upload for assignment files, proper submission flow with file attachments
- **Verdict:** Low priority for this week.

---

## 3. NOT STARTED

These features need to be built from scratch:

### 3.1 School Library (digital revision materials) — HIGH PRIORITY
- **Status:** ❌ Not started (reusing the concept from StudyMaterial but rebuilding)
- **What needs to be built:**
  - **New `Material` model** (or rename/extend `StudyMaterial`): title, description, subject, grade/class, type (pdf/worksheet/past-paper), fileUrl, organizationId, classId, uploadedById, createdAt
  - **File upload API route:** `/api/materials/upload` — accept file, store in blob storage, return URL
  - **Blob storage integration:** Need to pick and configure S3 / R2 / Vercel Blob
  - **Materials listing API:** `/api/materials` — GET list filtered by org + class + subject
  - **Teacher dashboard page:** Upload materials, list existing, filter by class/subject
  - **Student portal page:** Browse materials for their class, view/download
  - **Scoping:** Every query filters by `organizationId` first, then `classId`/`subject`
  - **Index:** Composite index on `[organizationId, classId]` for performance
- **Estimated effort:** 2-3 days (model + migration + blob storage setup + API + 2 UI pages)

### 3.2 AI Teacher ("Mwalimu") — HIGH PRIORITY
- **Status:** ✅ BUILT AND WORKING
- **Wait — this is already done.** The Groq/Llama integration exists with CBC-aware system prompts, subject selection, conversation history, rate limiting.
- **What exists:**
  - Backend: `/api/mwalimu/route.ts` — Groq API, Llama 3.3 70B, CBC-aware system prompt, grade-level complexity adjustment, Kenyan context
  - Frontend: `/components/mwalimu-chat.tsx` — floating chat widget, subject picker, message history
  - Rate limiting: 60s cooldown, 15 messages per 5-hour window
  - Auth: JWT-based (student portal)
- **What the plan wants that's missing:**
  - **Class-scoped context:** Current implementation knows the student's grade but not their specific class. Need to pass `classId` so the AI knows which subjects the student is studying.
  - **Teacher/parent conversation logs:** Need a page where teachers and parents can view AI chat history (safeguarding requirement). Currently conversations are in-memory only (last 10 messages) — need to persist to DB.
  - **RAG-lite from library materials:** If library materials exist, paste relevant text into the prompt. This depends on the School Library being built first. Once materials are in the DB, add a query to fetch relevant material text and inject it into the system prompt.
  - **Subject-level system prompts:** Different subjects should have different system prompts (e.g., Math tutor vs English tutor). Currently one prompt covers all subjects.
- **Estimated effort:** 1-2 days (add DB persistence, teacher log view, class scoping, RAG-lite integration)

### 3.3 Plan/Tier Field on School Model — MEDIUM PRIORITY
- **Status:** ❌ Not started
- **What needs to be built:**
  - Add `plan` field (enum: TRIAL, BASIC, PREMIUM) to `School` model
  - Add `isPilot` boolean field to `School` model
  - Add `pilotStartDate` and `pilotEndDate` fields (optional)
  - Migration to add fields to existing schools
  - No UI needed yet — just the schema fields for future billing integration
- **Estimated effort:** 30 minutes (schema + migration)

### 3.4 Class-Scoped Announcements / Feed — LOW PRIORITY
- **Status:** ❌ Not started (as class-scoped feature)
- **What exists:** School-wide `Announcement` model (no class scoping)
- **What needs to be built:**
  - Either add `classId` to existing `Announcement` model OR create new `Post` model
  - Staff creation form
  - API route for CRUD
  - Student/parent view filtered by their class
- **Estimated effort:** 1 day
- **Note:** Build only after Library + AI Teacher are solid

---

## 4. CONFLICTS & RISKS

### 4.1 Fee Locking Removal — POSITIVE CONFLICT
- **Current state:** No fee model exists. No locking logic. This is correct.
- **Plan initially proposed fee locking:** The plan document mentions "fee balance locking — report card auto-locks when fees are outstanding."
- **Resolution:** ✅ Peter says NO fee locking. Do not build it. The current codebase is correct. The `fees: []` empty array in `roles.ts` MODULE_ACCESS is fine — leave it empty or remove the fees key entirely.
- **Why this is right:** If schools are the customers, gating parents from seeing their child's report card over fees is hostile to the end user. Schools pay us. We help families for free.

### 4.2 Multi-Tenancy Implementation — MINOR CONFLICT
- **Plan says:** "Clerk Organizations (each school = one org, data isolated)"
- **Actual implementation:** `clerkOrgId` field on School exists but is set to synthetic values (`org_${userId}`). Multi-tenancy works via `schoolId` derived from staff lookup, not Clerk org boundaries.
- **Risk:** Low. Data isolation works. Clerk org feature is unused but not broken. For pilot scale, this is fine. Could migrate to real Clerk Organizations later if needed.
- **Action:** No change needed for this week.

### 4.3 Class Chat Exists — MINOR CONFLICT
- **Plan says:** "NOT a live chat / not bidirectional student messaging (deliberately, for safeguarding reasons)"
- **Actual implementation:** Full bidirectional class chat exists with real-time SSE streaming, cooldowns, and message limits.
- **Risk:** Medium. The plan explicitly says kid-to-kid messaging is out of scope for safeguarding. But the feature already exists and works.
- **Options:**
  1. Keep it — pilot schools might appreciate it, and the cooldown/limits provide some safeguarding
  2. Disable it by default — add a feature flag or role check so schools can opt in
  3. Remove it — rewrite as one-directional announcements only
- **Recommendation:** Keep it for now. It's already built. Let pilot schools decide if they want it. If safeguarding concerns arise, disable it.

### 4.4 No File Upload Infrastructure — BLOCKER
- **Impact:** Cannot build School Library without blob storage.
- **Current state:** No S3, R2, Vercel Blob, or any file storage. `fileUrl` fields on models are unused strings.
- **Resolution:** Must set up blob storage before building the Library. Recommend Vercel Blob (simplest with Next.js) or Cloudflare R2 (free tier, S3-compatible).
- **Action:** Set up blob storage as the first step of Library development.

### 4.5 Two Auth Systems — NOT A CONFLICT, JUST COMPLEXITY
- **Staff:** Clerk-based
- **Students/Parents:** Custom JWT
- **AI Teacher (Mwalimu):** JWT-based (student portal only)
- **Risk:** Low. Two auth systems is more complexity but both work. Students/parents not being in Clerk is fine — they're external users. Clerk handles the school staff side. No change needed.

### 4.6 StudyMaterial Model vs New Material Model — SCHEMA CONFLICT
- **Current:** `StudyMaterial` exists with fields: title, description, subject, grade, type, fileUrl, externalUrl
- **Plan needs:** Material with: organizationId, classId, subject, fileUrl, uploadedById
- **Options:**
  1. Rename and extend `StudyMaterial` — add `organizationId`, `classId`, `uploadedById`, rename to `Material`
  2. Create new `Material` model, leave `StudyMaterial` as-is (or drop it)
  3. Drop `StudyMaterial` entirely (it has no data, no API, no UI) and create `Material` fresh
- **Recommendation:** Option 3. `StudyMaterial` is a dead model — no routes, no pages, no data. Drop it in the migration and create `Material` from scratch with the right fields. Cleaner.

### 4.7 Announcement Model vs Post Model — SCHEMA CONFLICT
- **Current:** `Announcement` (school-wide, no class scoping)
- **Plan wants:** Class-scoped posts (announcements/assignments/materials)
- **Options:**
  1. Add `classId` to `Announcement` (optional field, null = school-wide)
  2. Create new `Post` model, leave `Announcement` as-is
- **Recommendation:** Option 1. `Announcement` already has a student-facing page. Just add `classId` as optional and update the queries. Less migration work.

---

## 5. BUILD ORDER (recommended)

### Phase 1: This Week (sales push — 100 cold calls, 8 pilot schools)

| Order | Feature | Effort | Status |
|-------|---------|--------|--------|
| 1 | Schema: Add `plan`, `isPilot`, `pilotStartDate`, `pilotEndDate` to School | 30 min | ❌ Not started |
| 2 | Schema: Drop `StudyMaterial`, create `Material` with proper fields | 1 hr | ❌ Not started |
| 3 | Blob storage: Set up Vercel Blob or R2 | 1 hr | ❌ Not started |
| 4 | API: Material CRUD + upload endpoint | 2 hrs | ❌ Not started |
| 5 | UI: Teacher material management page | 2 hrs | ❌ Not started |
| 6 | UI: Student material browser page | 1 hr | ❌ Not started |
| 7 | AI Teacher: Add DB persistence for conversations | 1 hr | ⚠️ Partial |
| 8 | AI Teacher: Add teacher/parent chat log viewer | 1 hr | ❌ Not started |
| 9 | AI Teacher: Add class scoping to system prompt | 30 min | ❌ Not started |
| 10 | AI Teacher: RAG-lite from library materials | 2 hrs | ❌ Not started |
| 11 | Announcements: Add `classId` to Announcement model | 30 min | ❌ Not started |
| 12 | Announcements: Staff creation form + API | 1 hr | ❌ Not started |

**Total estimated effort:** ~13 hours (1.5 - 2 days of focused work)

### Phase 2: After pilot schools are onboarded
- Class-scoped announcements (full feed)
- Feature flags for class chat (opt-in per school)
- Billing/tier integration (when pricing is decided)
- Versioning, folders, CMS for library (if schools ask for it)

---

## 6. WHAT'S ALREADY DEMO-READY

For the sales pitch this week, these are ready to show:

1. ✅ **CBC Report Cards** — The crown jewel. Full rubric system, printable reports, public parent view.
2. ✅ **Teacher Dashboard** — Students, attendance, grading, assignments, timetable, analytics.
3. ✅ **Parent Portal** — Report cards, attendance, assignments, messages.
4. ✅ **AI Teacher (Mwalimu)** — Chat widget, subject selection, CBC-aware responses. Needs DB persistence and teacher logs.
5. ✅ **Student Portal** — Dashboard, assignments, announcements.
6. ✅ **Multi-tenant** — Each school gets their own isolated data.

### What's demo-ready but needs the Library built:
- ❌ **School Library** — This is the missing piece for the "holiday revision" pitch. Teachers need to upload PDFs/worksheets, students need to browse them. Without this, the pitch falls flat.

### The pitch story:
> "Students lose momentum over school holidays. With Skuli, your teachers upload revision materials — past papers, worksheets, study guides — and students access them on their phones during the break. Plus, our AI Tutor answers their subject questions 24/7, constrained to CBC curriculum, so they're always learning on-syllabus. No more holiday learning loss."

**The Library is the enabler. Build it first. AI Teacher is the closer. Build it second.**

---

## 7. SUMMARY TABLE

| Feature | Plan Status | Codebase Status | Action |
|---------|-------------|-----------------|--------|
| Multi-tenant (Clerk) | Required | ✅ Built | No change |
| CBC Report Cards | Required | ✅ Built | No change |
| Fee Locking | Initially proposed | ✅ NOT BUILT (correct) | Do NOT build — schools pay, not parents |
| Teacher Dashboard | Required | ✅ Built | No change |
| Parent Portal | Required | ✅ Built | No change |
| Student Portal | Required | ✅ Built | No change |
| School Library (digital) | HIGH PRIORITY | ❌ Not started | Build first |
| AI Teacher | HIGH PRIORITY | ✅ Mostly built | Add persistence, logs, class scoping, RAG-lite |
| Class Announcements | LOW PRIORITY | ⚠️ Partial (no creation UI, no class scope) | Build after Library + AI |
| Class Chat | Out of scope | ✅ Already built | Keep, consider feature flag |
| Plan/Tier on School | Recommended | ❌ Not started | Add schema fields |
| `isPilot` flag | Recommended | ❌ Not started | Add schema fields |
| Blob Storage | Required for Library | ❌ Not started | Set up before Library |
| File Upload API | Required for Library | ❌ Not started | Build with Library |
| StudyMaterial model | Outdated | ⚠️ Schema only, unused | Drop and replace with Material |
| Post model (future) | Future | ❌ Not started | Phase 2 |

---

## 8. RISKS FOR PILOT WEEK

| Risk | Severity | Mitigation |
|------|----------|------------|
| No blob storage = no Library = no demo | HIGH | Set up Vercel Blob on day 1 |
| AI Teacher conversations not persisted = no safeguarding logs | MEDIUM | Add DB table before pilot |
| No teacher announcement creation = can't demo school communication | LOW | Build after Library |
| Class chat exists but plan says it shouldn't | LOW | Keep it, it's already built and useful |
| Two auth systems (Clerk + JWT) = complexity | LOW | Works fine, don't change |
| No billing/tier fields = can't differentiate pilot vs paying later | MEDIUM | Add schema fields now, takes 30 min |

---

*Report generated for Peter → Claude to finalize build order.*
