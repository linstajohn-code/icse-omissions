# ICSE Omissions

> Public reference for **ICSE Class 9 & 10 syllabus omissions** — every omission citable to the official [CISCE Regulations PDF](https://cisce.org/wp-content/uploads/2026/01/1.-Regulations.pdf).

## Current status

**Phase 0 — Planning artifacts only.** No application code yet.

| Phase | State        | What's in it                                                          |
| ----- | ------------ | --------------------------------------------------------------------- |
| 0     | ✅ done      | Architecture, data model, roadmap, subject seed list                  |
| 1     | ⏳ next      | CISCE PDF ingestion CLI → JSON → DB migrations                        |
| 2     |              | Read-only public app (dashboard, subject, chapter detail, FTS search) |
| 3     |              | Accounts & personalization (bookmarks, progress, notes)               |
| 4     |              | Admin panel (PDF upload, diff, manual edits, audit log)               |
| 5     |              | Nice-to-haves (AI summaries, exam countdown, PWA, etc.)               |

Read [`docs/roadmap.md`](./docs/roadmap.md) for phase exit criteria.

## Tech stack (locked)

- Next.js 15 (App Router) + TypeScript strict
- Tailwind + shadcn/ui + Framer Motion (transitions only)
- TanStack Query (server state) + Zustand (UI state)
- Supabase: Postgres + RLS + Auth + Storage (region: `ap-south-1` Mumbai)
- `pdf-parse` + `tesseract.js` (fallback) for ingest
- Vitest + Playwright + axe-core
- Vercel + Supabase Cloud
- pnpm, Node 22 LTS

Deviations require an ADR in [`docs/adr/`](./docs/adr/).

## Repo layout

```
.
├── README.md
├── docs/
│   ├── architecture.md      # system, auth, RLS, ingest overview
│   ├── data-model.md        # tables, RLS policies, indexes, JSON↔DB contract
│   ├── roadmap.md           # phases + exit criteria
│   ├── subjects.json        # 19-subject seed list
│   └── adr/                 # decision log (currently empty)
├── data/
│   └── subjects.json        # mirror of docs/subjects.json (consumed by ingest)
├── schemas/
│   └── subjects.schema.json
├── .github/workflows/ci.yml # CI stub; full wiring in Phase 1
├── package.json
├── tsconfig.json
└── .nvmrc                   # 22
```

The `app/`, `src/`, `supabase/`, and `scripts/` directories arrive in Phase 1.

## Getting started (Phase 0)

```bash
nvm use                       # Node 22
corepack enable               # makes pnpm available
pnpm install                  # nothing to install yet — manifest is empty
```

The `pnpm` scripts are stubs that exit 0 with a placeholder message. They become real in Phase 1.

## Non-negotiables

- TypeScript strict everywhere. No `any` without an inline `// reason:` comment.
- **Every omission must cite a PDF page.** If we can't cite it, we don't show it.
- RLS policies are tested in Playwright; app-layer checks are defence-in-depth.
- No mock data in production paths. Seed data comes from the ingest pipeline only.
- Conventional commits, one concern per commit.
- Lighthouse on chapter detail page: perf ≥95, **a11y =100**, best-practices ≥95 — CI-gated before Phase 2 is "done."

## Reporting issues / contributing

Phase 0 — no contribution flow yet. Issues will be opened against this repo once Phase 1 starts.
