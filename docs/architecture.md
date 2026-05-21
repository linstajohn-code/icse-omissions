# Architecture

> **Status:** Phase 0 (planning). No application code yet. Phase 1 (ingestion pipeline) is next.

## 1. Purpose

A web platform where students, teachers, parents, and school administrators can browse the **ICSE Class 9 & 10 syllabus** and clearly see **which portions CISCE has omitted** for the current academic session.

The product's defining commitment: **every omission is traceable back to a specific page in the official CISCE Regulations PDF**. We do not show an omission we cannot cite.

Authoritative source: <https://cisce.org/wp-content/uploads/2026/01/1.-Regulations.pdf>

## 2. Tech stack (locked)

| Concern             | Choice                                      |
| ------------------- | ------------------------------------------- |
| Framework           | Next.js 15 (App Router) + TypeScript strict |
| UI                  | Tailwind CSS + shadcn/ui                    |
| Animation           | Framer Motion (transitions only)            |
| Server state        | TanStack Query                              |
| Client UI state     | Zustand                                     |
| Database + Auth     | Supabase (Postgres + RLS + Auth + Storage)  |
| Region              | `ap-south-1` (Mumbai)                       |
| PDF text extraction | `pdf-parse`                                 |
| OCR fallback        | `tesseract.js`                              |
| Unit tests          | Vitest                                      |
| E2E tests           | Playwright                                  |
| Accessibility tests | `axe-core`                                  |
| Hosting             | Vercel (web) + Supabase Cloud (data)        |
| Package manager     | pnpm                                        |
| Node               | 22 LTS (pinned in `.nvmrc`)                 |

Stack deviations require a written ADR under `docs/adr/`.

## 3. System diagram

```
┌────────────────────────────┐          ┌──────────────────────────┐
│  Next.js 15 (Vercel)       │          │  Supabase (ap-south-1)   │
│                            │ TanStack │  ┌────────────────────┐  │
│  • App Router              │  Query   │  │ Postgres + RLS     │  │
│  • shadcn/ui + Tailwind    │◄────────►│  │ Auth (email+Google)│  │
│  • Framer Motion           │   HTTPS  │  │ Storage (PDFs)     │  │
│  • Zustand                 │          │  └────────────────────┘  │
│  • /admin (Phase 4)        │          └──────────▲───────────────┘
└──────────┬─────────────────┘                     │
           │                                       │ pnpm ingest:cisce
           │                       ┌───────────────┴───────────────┐
           │                       │  Ingest CLI (Node)            │
           │                       │  • pdf-parse (text layer)     │
           │                       │  • tesseract.js (OCR fallback)│
           │                       │  • writes /data/omissions/**  │
           │                       │  • writes ingest-report.md    │
           │                       └───────────────┬───────────────┘
           │                                       │
           │                          ┌────────────┴────────────┐
           │                          │  Versioned migrations    │
           │                          │  seed Postgres from JSON │
           └──────────────────────────┴──────────────────────────┘
```

## 4. Data flow

1. **Source of truth:** the CISCE Regulations PDF. We pin a copy in Supabase Storage (`cisce-pdfs/<sha256>.pdf`) so the cited page numbers never drift if CISCE re-uploads.
2. **Ingest:** `pnpm ingest:cisce -- --pdf=<path>` parses the PDF into per-subject JSON at `/data/omissions/<class>/<subject>.json`. JSON files are committed to git — that is the canonical artifact, not the DB.
3. **Migrate:** a versioned SQL migration seeds Postgres from the JSON.
4. **Serve:** the Next.js app reads from Postgres via the Supabase JS client through TanStack Query. Public pages use the anon key + RLS public-read policies; authenticated features use the user's JWT.
5. **Admin updates** (Phase 4): admin uploads a new PDF → re-ingest → diff UI → admin approves → audit log entry → migration applied. Never edited directly in the DB.

## 5. Auth model

- **Provider:** Supabase Auth — email + Google OAuth.
- **Roles:** `student` (default on signup), `teacher`, `admin`. Stored in `users.role`, enforced via Postgres RLS, **never** via app-only checks.
- **Role assignment:** students self-serve. `teacher` and `admin` are granted only by an existing admin via the admin panel; the assignment itself is audit-logged.
- **Public surface:** the dashboard, subject pages, chapter detail, and search are **fully public** (no login required). The product is meant to be discoverable.
- **Authenticated surface:** bookmarks, mark-as-revised, personal notes, exportable checklist (Phase 3); admin panel (Phase 4).

## 6. RLS strategy

One-line policy summary (full SQL in [`data-model.md`](./data-model.md)):

| Table family          | Read                          | Write                           |
| --------------------- | ----------------------------- | ------------------------------- |
| Taxonomy (subjects, chapters, topics, omissions, classes, cisce_circulars) | Public (`deleted_at is null`) | Admin only                      |
| User-owned (bookmarks, user_progress, notes) | `auth.uid() = user_id`        | `auth.uid() = user_id`          |
| `users`               | Self read; admin reads all    | Self update (limited columns); role changes admin-only |
| `audit_log`           | Admin only                    | Insert via DB trigger only      |

**RLS is verified by Playwright tests** in Phase 3 — one logged-in session per role asserts what each can read and write. App-layer enforcement is treated as defence-in-depth, never as the primary gate.

## 7. Ingest pipeline (overview — details in `data-model.md` and Phase 1 plan)

1. **Inspect first, code second.** Phase 1 begins with installing `poppler-utils`, dumping the actual PDF text, and inspecting the structure of the omissions section. We do not write regex against guesses.
2. **Deterministic parser first.** Regexes tuned to CISCE's actual heading/bullet conventions.
3. **OCR fallback** (`tesseract.js`) only for pages where `pdf-parse` returns empty text (image-only pages).
4. **Output:** JSON per subject, with `{ chapter, topic, status, source_page, source_excerpt, cisce_circular_id, effective_session }`.
5. **Never silently drop.** Every section the parser cannot classify is appended to `ingest-report.md` with the page number and raw excerpt for human review.
6. **Tests:** Vitest unit tests against at least 3 representative real-PDF pages, snapshotted.

## 8. Quality bars (CI-enforced)

| Concern         | Bar                                                                                  | Where checked            |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| TypeScript      | `strict: true`, `noUncheckedIndexedAccess: true`. No bare `any` without a `// reason:` comment | `tsc --noEmit` in CI     |
| Lint            | ESLint + `@typescript-eslint`                                                        | CI                       |
| Tests           | Vitest (unit), Playwright (E2E)                                                      | CI                       |
| Accessibility   | `axe-core` clean on every page                                                       | Playwright + CI          |
| Lighthouse      | Chapter detail page: perf ≥95, **a11y =100**, best-practices ≥95                     | Lighthouse CI (Phase 2)  |
| Build           | `pnpm build` warning-free                                                            | CI                       |
| Commits         | Conventional (`feat:`, `fix:`, `chore:`, `docs:`), one concern each                  | Commitlint (Phase 1)     |

## 9. Performance and a11y commitments

- **Mobile-first.** Most students will visit on phones. Layouts collapse cleanly to 360 px wide.
- **Colorblind-safe omission marking.** Strikethrough + badge (`OMITTED` / `PARTIAL`) + muted color + `aria-label` + screen-reader-only text. Color is never the only signal.
- **Dark/light mode** via Tailwind `dark:` and a Zustand-backed user preference, with `prefers-color-scheme` as the default.
- **No layout shift** on omission badges (reserved space).
- **Source PDF preview** opens in an accessible viewer with the cited page anchored.

## 10. Out of scope

Payments, native mobile apps, parent–teacher messaging, video hosting, third-party LMS integrations.

**Explicitly not built** (scope traps): gamification, multi-language UI, OCR-on-arbitrary-upload, AI exam-priority prediction.

## 11. Decision log

Stack deviations or material design decisions are recorded as ADRs in `docs/adr/NNNN-title.md` (one paragraph minimum: context, decision, consequence).
