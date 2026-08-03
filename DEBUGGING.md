# Skuli-ERP — Debugging Context (Aug 2026)

## Architecture Overview

- **Stack**: Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Clerk (for portal parents), custom JWT `skuli_token` for independent students
- **Deploy**: Vercel manual (`vercel --yes --prod`). Production: `https://skulix.vercel.app`
- **Auth**: Independent students use `skuli_token` cookie (custom JWT, not Clerk). `getTokenFromRequest()` in `src/lib/auth.ts` checks Authorization header first, then cookie.
- **Middleware**: `src/middleware.ts` uses Clerk but ALL student routes are public (`/student(.*)`), all API routes listed are public. Clerk is NOT used for student auth.

---

## ISSUE 1: Revision Papers — 404 Errors

### What happens
User reports revision papers hit 404s when trying to use the feature.

### Current state
- Page exists at `src/app/student/revision-papers/page.tsx` — returns HTTP 200
- API `GET /api/revision-papers` works — returns 4 papers (all are AI-generated test results, NOT actual school revision papers)
- API `GET /api/revision-papers/[id]` works for existing IDs, returns 404 for non-existent ones
- API `POST /api/revision-papers/grade` exists and works
- The page has NO `params` — it's a single page, no dynamic routing

### Likely root cause
The revision papers page fetches papers from the `revisionPaper` table via `GET /api/revision-papers`. There are only 4 records in the DB and they're AI test results (from `POST /api/test-revision`), not actual exam papers. When the user clicks "View Paper" on one of these, it calls `GET /api/revision-papers/${paper.id}` which should work for existing IDs.

**BUT** — the `viewPaper()` function in the page calls `GET /api/revision-papers/${paper.id}` and the response structure is `{ paper: { ...paper, content: parsedContent } }`. If the content field is null/empty, the modal opens but shows nothing useful.

**Key question**: Where exactly does the 404 happen? Is it:
1. The page itself returning 404? (unlikely — server returns 200)
2. The `GET /api/revision-papers/${id}` returning 404? (possible if paper IDs are stale)
3. Some other route being called that doesn't exist?

### Files involved
- `src/app/student/revision-papers/page.tsx` — The page (calls `/api/revision-papers` and `/api/revision-papers/${id}`)
- `src/app/api/revision-papers/route.ts` — Lists papers from `prisma.revisionPaper`
- `src/app/api/revision-papers/[id]/route.ts` — Gets single paper, parses content JSON
- `src/app/api/revision-papers/grade/route.ts` — AI grading endpoint (requires auth)
- `src/app/api/revision-papers/generate/route.ts` — Paper generation endpoint
- `src/middleware.ts` — All these routes are public

### What to investigate
1. Open browser DevTools Network tab and see which exact request returns 404
2. Check if the `revisionPaper` table has the data the user expects
3. Check if there's a `POST /api/revision-papers/grade` 404 — the grade endpoint requires auth, so if `skuli_token` is missing/expired, it returns 401 (not 404)
4. Check if there are other pages that reference revision paper routes that might not exist

---

## ISSUE 2: Chat History Not Visible

### What happens
User sends messages to Mwalimu, but after page refresh, chat history doesn't appear.

### Current flow
1. **Saving**: `POST /api/mwalimu` saves each message to `mwalimuMessage` table with `studentId` extracted from JWT
2. **Loading**: Frontend fetches `GET /api/mwalimu/history?limit=50` with Bearer token
3. **Display**: Messages are set in state and rendered

### Code analysis

**Frontend** (`src/app/student/mwalimu/page.tsx:36-73`):
```js
// On mount, extracts studentId from cookie
// Calls /api/mwalimu/history?limit=50 with Bearer token
// If data.messages.length > 0, sets messages state
```

**History API** (`src/app/api/mwalimu/history/route.ts`):
- Uses `getTokenFromRequest(req)` → extracts from Authorization header
- Calls `verifyToken(token)` → gets studentId
- Queries `prisma.mwalimuMessage.findMany({ where: { studentId } })`
- Returns `{ messages: [...] }`

**Message saving** (`src/app/api/mwalimu/route.ts:173-199`):
- `studentId` comes from JWT: `const studentId = "studentId" in session ? session.studentId : null;`
- Only saves if `studentId` is truthy
- Now has `console.error` logging on failure

### Likely root causes (in order of probability)

1. **`studentId` is null/undefined in the JWT**: The JWT payload might not include `studentId`. Check what's in the token by decoding it: `atob(token.split('.')[1])` in browser console. The student login flow might be putting a different field name.

2. **Messages save fails silently**: The `catch {}` was swallowing errors. We added `console.error` but need to check Vercel logs. The `prisma.mwalimuMessage.create()` might fail if the `studentId` doesn't exist in the `Student` table (foreign key constraint).

3. **History API returns 401**: The token extraction in the history route might not work. The frontend sends `Authorization: Bearer ${token}` but the history route also checks cookies. Need to verify the token is being sent correctly.

4. **`findMany` with `subject` filter issue**: The history route has `...(subject ? { subject } : {})` — when no subject is passed, it returns ALL messages for the student. This should work.

5. **Messages are for a different `studentId`**: If the student logged in via a different method (e.g., Clerk vs custom JWT), the studentId might differ between login sessions.

### Files involved
- `src/app/student/mwalimu/page.tsx:36-73` — Frontend history loading
- `src/app/api/mwalimu/history/route.ts` — History API
- `src/app/api/mwalimu/route.ts:173-199` — Message saving (now with console.error)
- `src/lib/auth.ts` — JWT helpers (`verifyToken`, `getTokenFromRequest`)
- `prisma/schema.prisma` — `MwalimuMessage` model

### What to investigate
1. Open browser DevTools → Application → Cookies → check `skuli_token` value, decode JWT payload, verify `studentId` field exists
2. Open browser DevTools → Network → refresh Mwalimu page → check `/api/mwalimu/history` response
3. Check Vercel logs for "Failed to save user message:" and "Failed to save assistant message:" errors
4. Check if `mwalimuMessage` table has any rows: `SELECT COUNT(*) FROM "MwalimuMessage"`
5. Run `SELECT DISTINCT "studentId" FROM "MwalimuMessage"` to see what studentIds are being saved
6. Compare with `SELECT studentId FROM "Student"` to verify foreign key matches

### Quick test
In browser console on the Mwalimu page:
```js
// Check JWT payload
const cookie = document.cookie.split("; ").find(c => c.startsWith("skuli_token="));
const token = cookie?.split("=")[1];
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("JWT payload:", payload);
console.log("studentId:", payload.studentId);

// Test history API directly
fetch("/api/mwalimu/history?limit=5", { headers: { Authorization: `Bearer ${token}` } })
  .then(r => r.json()).then(d => console.log("History:", d));
```

---

## ISSUE 3: Chat UI Still Compacted

### What happens
User reports chat messages are still cramped/compacted despite spacing changes being deployed.

### What was changed
In `src/app/student/mwalimu/page.tsx`, the return JSX was updated with:
- Message container: `space-y-5` (was `space-y-3`), `mb-6 px-1` (was `mb-4`)
- Message bubbles: `max-w-[80%] rounded-2xl px-5 py-3` (was `max-w-[75%] rounded-xl px-4 py-2.5`)
- Input area: `gap-3`, input `px-5 py-3.5`, button `px-6 py-3.5` (was `gap-2`, `px-4 py-3`, `px-5 py-3`)
- Header: `mb-8` (was `mb-6`)
- Empty state: `py-16`, `w-14 h-14`, `text-base` (was `py-12`, `w-12 h-12`, `text-sm`)

### Deployment status
- Code committed and pushed to GitHub ✅
- Deployed via `vercel --yes --prod` ✅
- Vercel confirmed "Ready" ✅

### Possible causes

1. **Browser cache**: The user's browser might be caching old JS/CSS bundles. Vercel serves hashed assets, so a hard refresh (`Ctrl+Shift+R`) or incognito window should show changes.

2. **CSS specificity**: Tailwind classes might be overridden by CSS in `src/app/globals.css`. Check if there are any `!important` rules or higher-specificity selectors affecting the chat layout.

3. **Parent layout constraint**: The student layout (`src/app/student/layout.tsx:97`) has `<main className="flex-1 overflow-auto p-4 sm:p-6">`. This adds `p-4` (16px) padding on mobile, `p-6` (24px) on desktop. This is fine but might make things feel "padded but still cramped" if the chat container isn't using full height.

4. **The `h-[calc(100vh-8rem)]` might not work as expected**: If the layout's `<main>` has its own scroll behavior (`overflow-auto`), the chat's height calculation might be off. The chat tries to fill `100vh - 8rem` but the main element might not be that tall.

5. **Tailwind CSS v4 JIT**: Tailwind v4 might be tree-shaking unused classes. Check if `space-y-5`, `px-5`, `py-3`, `rounded-2xl` etc. are actually being compiled. Run `npm run build` locally and check the CSS output.

### Files involved
- `src/app/student/mwalimu/page.tsx` — Chat UI (client component)
- `src/app/student/layout.tsx:97` — `<main>` wrapper with `p-4 sm:p-6`
- `src/app/globals.css` — Global styles and CSS variables
- `tailwind.config.ts` — Tailwind configuration

### What to investigate
1. Open browser DevTools → Elements → inspect the chat message `<div>` elements, check computed styles for `padding`, `gap`, `max-width`, `border-radius`
2. Check if the deployed Vercel build matches the committed code — compare file hashes
3. Try hard refresh (Ctrl+Shift+R) or open in incognito window
4. Check `npm run build` output for any CSS issues
5. Look at the network tab for the main CSS bundle, search for `space-y-5` or `px-5` to verify they're compiled

### Quick check
Run locally:
```bash
npm run build 2>&1 | grep -i "mwalimu\|error\|warn"
```

---

## Environment & Secrets

| Variable | Value | Location |
|----------|-------|----------|
| `JWT_SECRET` | `skuli-pilot-jwt-secret-2026` | Vercel env |
| `DATABASE_URL` | Neon Postgres connection string | Vercel env |
| `GROQ_API_KEY` | `gsk_...` (primary) | Vercel env |
| `NVIDIA_API_KEY` | 4 keys `nvapi-...` | Vercel env |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | Vercel env |
| `CLERK_SECRET_KEY` | `sk_test_...` | Vercel env |
| Clerk Dashboard | `https://joint-grouper-68.clerk.accounts.dev` | |

---

## Key File Paths

| File | Purpose |
|------|---------|
| `src/app/student/mwalimu/page.tsx` | Mwalimu chat UI — history loading + display |
| `src/app/student/mwalimu/test/page.tsx` | Test generation/taking/grading flow |
| `src/app/student/my-tests/page.tsx` | Past tests list + review |
| `src/app/student/revision-papers/page.tsx` | Revision papers browser + test modal |
| `src/app/student/layout.tsx` | Student sidebar + main content wrapper |
| `src/app/api/mwalimu/route.ts` | POST: Chat endpoint (saves to DB) |
| `src/app/api/mwalimu/history/route.ts` | GET: Chat history |
| `src/app/api/mwalimu/test/route.ts` | POST: Generate test, PATCH: Grade test |
| `src/app/api/revision-papers/route.ts` | GET: List revision papers |
| `src/app/api/revision-papers/[id]/route.ts` | GET: Single paper |
| `src/app/api/revision-papers/grade/route.ts` | POST: Grade paper with AI |
| `src/app/api/test-revision/route.ts` | GET: List past tests, POST: Save test results |
| `src/app/api/test-revision/explain/route.ts` | POST: AI explanation for wrong answer |
| `src/lib/auth.ts` | JWT sign/verify, `getTokenFromRequest` |
| `src/lib/ai-providers.ts` | Groq + NVIDIA AI chain |
| `src/middleware.ts` | Clerk middleware (student routes are public) |
| `src/app/globals.css` | CSS variables, theme |
| `prisma/schema.prisma` | All DB models |
| `DESIGN-SYSTEM.md` | Design system docs |

---

## Deployment Checklist

```bash
# Build
npm run build

# Deploy
vercel --yes --prod

# Check deployment
curl -s -o /dev/null -w "%{http_code}" https://skulix.vercel.app/student/mwalimu
curl -s -o /dev/null -w "%{http_code}" https://skulix.vercel.app/student/revision-papers
curl -s -o /dev/null -w "%{http_code}" https://skulix.vercel.app/api/mwalimu/history

# Check DB
curl -s "https://skulix.vercel.app/api/revision-papers" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('papers',[])))"

# Vercel logs (if accessible)
vercel logs skulix.vercel.app --follow
```

---

## What To Fix (Suggested Order)

1. **Chat history**: Check JWT payload has `studentId`. Check DB for `mwalimuMessage` rows. Check Vercel logs for save errors. Add more logging if needed.
2. **Chat spacing**: Hard refresh browser. Check computed styles in DevTools. If still compacted, check CSS compilation.
3. **Revision papers 404**: Identify exact 404 URL from Network tab. Check if it's a page 404 or API 404. If API, check the `revisionPaper` table for matching IDs.
