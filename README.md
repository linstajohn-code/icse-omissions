# ICSE Syllabus 2027-28

> Browse ICSE Class 9 & 10 syllabus omissions for the current session.  
> Every omission is cited to the official CISCE circular PDF — page number + verbatim excerpt.

**Live:** set `NEXT_PUBLIC_BASE_URL` and deploy to Vercel (see below).

---

## Features

| Area | What's built |
|---|---|
| **Syllabus browser** | Home → Class → Subject → Chapter → Topic, with omission status badges |
| **Omissions first** | Red/amber tinted cards, strikethrough text, colourblind-safe (3 non-colour signals) |
| **Source citations** | Every topic shows PDF page number + verbatim excerpt; "View PDF" deep-link |
| **Print checklist** | `/class/[cls]/subject/[slug]/print` — table with ☐ / ✕ / ◐ symbols, save-as-PDF |
| **Search** | Full-text across all 873 topics; "Omitted/Partial only" filter |
| **Exam countdown** | Days to ICSE 2028 board exams, urgency-colour as the date approaches |
| **Auth** | Supabase email magic-link + Google OAuth |
| **Personalization** | Bookmarks, progress (not started / in progress / revised), inline notes |
| **Account page** | Progress breakdown bars, bookmarked topics list, notes count |
| **Admin panel** | `/admin` — soft-delete topics/chapters, edit omission status, audit log |
| **Audit log** | Every admin action logged with actor, change reason, field-level diff |
| **PWA** | Web app manifest (installable on mobile) |
| **SEO** | `sitemap.xml`, `robots.txt`, security headers, CSP |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router + React 19 |
| Language | TypeScript strict (`noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS v4 + next-themes |
| Database | Supabase (Postgres + RLS + Auth) |
| Auth client | `@supabase/ssr` v0.10 |
| Data layer | JSON files (public syllabus) + Supabase (personalization) |
| Testing | Playwright (RLS + integration) |
| Deployment | Vercel (region: `bom1` Mumbai) + Supabase Cloud |

---

## Project structure

```
.
├── app/                        Next.js App Router
│   ├── page.tsx                Homepage (countdown + class cards)
│   ├── class/[cls]/            Subject grid
│   │   └── subject/[subject]/
│   │       ├── page.tsx        Chapter list + "Print checklist" link
│   │       ├── [chapter]/      Topic list with status + citations
│   │       └── print/          Printable revision checklist
│   ├── search/                 Full-text search with status filter
│   ├── account/                User dashboard (bookmarks, progress, notes)
│   ├── auth/                   Login, callback, error pages
│   ├── admin/                  Admin panel (role-gated)
│   └── api/                    bookmarks · progress · notes
├── src/
│   ├── components/             UI + feature components
│   ├── lib/                    data.ts · subjects.ts · admin-actions.ts
│   └── types/                  database.ts · ingest.ts
├── data/omissions/             873 JSON entries (9/ and 10/ subdirs)
├── scripts/seed-db.ts          Populates Supabase from JSON
├── supabase/migrations/        0001_init · 0002_seed_taxonomy · 0004_admin_ops
└── e2e/rls.test.ts             Playwright RLS invariants
```

---

## Setup

### 1. Install dependencies

```bash
nvm use          # Node 22 LTS
pnpm install
```

### 2. Create a Supabase project

Go to [app.supabase.com](https://app.supabase.com) → New project.  
Recommended region: **ap-south-1 (Mumbai)** for Indian audience.

### 3. Apply migrations

In the Supabase **SQL Editor → New query**, run each file in order:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_seed_taxonomy.sql
supabase/migrations/0004_admin_ops.sql
```

### 4. Configure environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Base URL for sitemap + robots (set to your Vercel domain)
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

Keys are in Supabase → Settings → API.

### 5. Seed the database

```bash
pnpm db:seed
```

Reads `data/omissions/**/*.json` and inserts chapters/topics/omissions.  
Idempotent — safe to re-run.

### 6. Run the dev server

```bash
pnpm dev
# → http://localhost:3000
```

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm db:seed` | Seed Supabase from JSON files (requires `.env.local`) |
| `pnpm test:e2e` | Run Playwright RLS tests (requires live Supabase + 2 test users) |

---

## Admin panel

1. Sign in with the account you want to promote.
2. In Supabase SQL Editor:
   ```sql
   update users set role = 'admin' where email = 'your@email.com';
   ```
3. Visit `/admin`.

Admin can:
- Edit omission status (`omitted` / `partial` / `included`) with a required change reason
- Soft-delete topics and chapters (sets `deleted_at` — no hard deletes)
- View paginated audit log with full field-level diffs

---

## E2E tests

Tests require two real Supabase users with email + password auth enabled.

Add to `.env.local`:
```bash
E2E_USER_A_EMAIL=student-a@example.com
E2E_USER_A_PASSWORD=…
E2E_USER_B_EMAIL=student-b@example.com
E2E_USER_B_PASSWORD=…
```

```bash
pnpm test:e2e
```

Tests prove:
- Unauthenticated users cannot create bookmarks/progress/notes (401)
- Student A's bookmarks/progress/notes are invisible to Student B
- Direct REST inserts on `omissions` are rejected by RLS
- Only the service role can read `audit_log`

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import into [vercel.com](https://vercel.com/new).
3. Set environment variables in Project Settings → Environment Variables (same as `.env.local`).
4. Deploy — Vercel auto-detects Next.js.

Region is pre-configured as `bom1` (Mumbai) in `vercel.json`.

---

## Non-negotiables

- **TypeScript strict** — no `any` without an inline `// reason:` comment.
- **Every omission cites a PDF page.** If it can't be cited, it isn't shown.
- **RLS tested** — Playwright asserts what each role can and cannot see.
- **No mock data in production paths.** Seed data comes from the ingest pipeline.
- **Soft-delete only** — `deleted_at` column; no hard deletes from the app layer.
- **Conventional commits** — one concern per commit.
