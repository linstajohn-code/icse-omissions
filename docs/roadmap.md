# Roadmap

> Phases are sequential. Do not skip ahead. Each phase has explicit **exit criteria**; nothing about the next phase begins until the previous one's criteria are met.

## Phase 0 — Plan *(this phase)*

**Goal:** lay the conceptual foundation in `/docs` and scaffold the empty project.

**Deliverables**
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/roadmap.md` (this file)
- `docs/subjects.json` and `data/subjects.json`
- `docs/adr/` (empty, ready)
- `package.json` (pnpm, Next.js 15, TypeScript strict)
- `tsconfig.json`, `.gitignore`, `.editorconfig`, `.nvmrc`, `README.md`
- Schema file `schemas/subjects.schema.json`
- CI workflow stub at `.github/workflows/ci.yml`

**Exit**
- User reviews and approves all four `/docs` artifacts.
- Repo has one or two atomic commits: `docs: phase 0 planning artifacts`, `chore: scaffold pnpm + ts strict`.
- No `app/` directory and no DB code yet.

---

## Phase 1 — Ingestion pipeline *(the moat)*

**Goal:** transform the CISCE Regulations PDF into structured, citable JSON.

**Deliverables**
- `pnpm ingest:cisce -- --pdf=<path>` CLI script.
- Deterministic parser that runs first; OCR (`tesseract.js`) only as fallback on image-only pages.
- Output: `/data/omissions/<class>/<subject>.json` for every subject we can extract.
- `ingest-report.md` listing every unparseable section with page + excerpt (no silent drops).
- Vitest unit tests against ≥3 representative real-PDF pages (fixtures committed).
- Supabase project provisioned (`ap-south-1`).
- Migrations `0001_init.sql` (schema, RLS, triggers, views) and `0002_seed_taxonomy.sql` (classes + subjects).
- Migration `0003_seed_omissions.sql` generated from the JSON.
- JSON Schema validation (`schemas/omission.schema.json`) wired into the CLI.

**Exit**
- For at least **Mathematics, Physics, and one humanities subject** (e.g. History/Civics/Geography), every omission in JSON has a working `source_page` + `source_excerpt`, spot-checked against the PDF by hand.
- `pnpm test` green; `pnpm build` clean.
- DB seeded; `select count(*) from omissions where status != 'included'` returns a sensible number.

---

## Phase 2 — Read-only public app

**Goal:** ship the trustworthy public reference.

**Deliverables**
- **Home dashboard:** Class 9 / Class 10 toggle, subject grid with per-subject counts (chapters, omitted, partial).
- **Subject page:** chapters list; each expandable to topics. Omitted topics visually distinct (strikethrough + badge + muted color + screen-reader text).
- **Chapter detail page:** included topics, omitted topics, every omission shows a "View source" link opening a PDF preview anchored to the cited page.
- **Search:** Postgres full-text search across subjects, chapters, topics with result highlighting.
- **Dark/light mode**, mobile-first.
- `axe-core` integrated into Playwright; runs in CI.
- Lighthouse CI on the chapter detail page.

**Exit**
- Lighthouse on chapter detail page: **performance ≥95**, **a11y =100**, **best-practices ≥95**.
- CI green: lint, typecheck, unit tests, E2E tests, axe.
- Manual a11y check with VoiceOver / NVDA on the chapter detail page passes (notes recorded).

---

## Phase 3 — Accounts & personalization

**Goal:** turn passive readers into engaged users without compromising the public surface.

**Deliverables**
- Supabase Auth: email magic-link + Google OAuth.
- `handle_new_user` trigger creating `users` row with `role='student'`.
- Bookmarks, mark-as-revised (`user_progress`), personal notes.
- Personal revision checklist exportable to PDF.
- Playwright RLS test suite: one session per role.

**Exit**
- Playwright tests prove:
  - A student cannot read another student's bookmarks / progress / notes.
  - A student cannot mutate `omissions`, `chapters`, `topics`.
  - A teacher cannot mutate `omissions` (read-only, same as students for taxonomy).
  - An admin can mutate `omissions`; each mutation creates an `audit_log` row with full `diff_jsonb`.

---

## Phase 4 — Admin panel

**Goal:** make the platform maintainable without DB access.

**Deliverables**
- `/admin` route group, admin-only via middleware **and** RLS.
- Upload new CISCE PDF → background job runs ingest → diff UI compares new JSON vs current DB → admin approves selected changes → migration generated/applied → audit log entries written.
- Manual edit UI for `chapters` / `topics` / `omissions`, requiring `change_reason`.
- No hard deletes; soft-delete with confirmation.
- Audit log viewer with filters (entity, actor, date).

**Exit**
- Admin uploads a deliberately modified copy of the PDF; the diff UI surfaces the changes; approving them writes to `audit_log` with correct before/after `diff_jsonb`.
- Soft-deleted rows disappear from public views but remain queryable by admin.

---

## Phase 5 — Nice-to-haves (cherry-pick)

Choose based on remaining time and signal. Each requires its own short plan before starting.

- **AI chapter summaries** via the Claude API. Cached per `(topic_id, model, version)`. UI carries an inline disclaimer: *"AI-generated, verify with your teacher."*
- **Exam countdown** for the relevant ICSE board exam dates.
- **Study streaks** (light-touch; no gamification creep).
- **PWA offline mode** with a service worker caching subject pages.
- **Push notifications** for new CISCE circulars.

## Explicitly out of scope (forever)

Payments, native mobile apps, parent–teacher messaging, video hosting, third-party LMS integrations. These are separate products.

## Explicitly not built (scope traps)

Gamification, multi-language UI, OCR-on-arbitrary-upload, AI exam-priority prediction.

## How phases are gated

- Each phase ends with a recorded checklist on the closing PR matching its exit criteria.
- No phase begins until the user signs off the previous one ("go").
- If we hit ambiguity in the CISCE PDF (formatting inconsistencies, ambiguous omission language), we surface it in `ingest-report.md` and ask — we do **not** invent interpretations.
