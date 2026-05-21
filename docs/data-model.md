# Data Model

> **Status:** Phase 0 proposal. This document is the contract for Phase 1's migration.

## 1. Design principles

1. **Citations are first-class.** No row in `omissions` can exist without `source_page` and `source_excerpt` — enforced by `NOT NULL`.
2. **Source of truth lives in JSON, not the DB.** `/data/omissions/**/*.json` is committed to git. Migrations seed the DB from it. The DB is rebuildable; the JSON is not.
3. **Soft delete only** on user-facing taxonomy. Hard deletes destroy history we may need for diff & audit.
4. **Academic-year scoped.** Every omission carries `effective_session` (e.g. `"2026-27"`). The UI defaults to "current," teachers can compare years.
5. **RLS, not app code, gates writes.** App-layer checks are belt-and-braces.

## 2. ERD

```
classes (1) ──< (N) subjects ──< (N) chapters ──< (N) topics ──< (N) omissions
                                                                       │
                                                              (N) ──── │
                                                                       │
                                                          cisce_circulars
                                                          (referenced by omissions)

users (1) ──< (N) bookmarks       ──> topics
users (1) ──< (N) user_progress   ──> topics
users (1) ──< (N) notes           ──> topics

audit_log (no FKs to allow logging deletions; entity_table+entity_id is informational)
```

## 3. Table-by-table

Column types are Postgres. `id` defaults to `uuid primary key default gen_random_uuid()` unless stated. `created_at timestamptz not null default now()` is implicit on all tables.

### 3.1 `classes`
| column | type           | notes                              |
| ------ | -------------- | ---------------------------------- |
| id     | smallint PK    | We hard-code `9` and `10`          |
| label  | text not null  | e.g. "Class 9"                     |
| slug   | text unique not null | `class-9`, `class-10`        |

**Why a smallint PK** instead of uuid: there are exactly two rows, ever; the value is the natural key.

### 3.2 `subjects`
| column     | type                | notes                                    |
| ---------- | ------------------- | ---------------------------------------- |
| id         | uuid PK             |                                          |
| class_id   | smallint FK→classes | `on delete restrict`                     |
| code       | text not null       | CISCE subject code, e.g. `MATH`          |
| name       | text not null       |                                          |
| `group`    | text not null check (`group` in ('I','II','III')) |                  |
| slug       | text not null       |                                          |
| created_at | timestamptz         |                                          |

**Unique**: `(class_id, slug)` — drives the `/class/:n/subject/:slug` URL.
**Unique**: `(class_id, code)`.
**Index**: `(class_id)` for the dashboard grid query.

### 3.3 `chapters`
| column     | type                | notes                              |
| ---------- | ------------------- | ---------------------------------- |
| id         | uuid PK             |                                    |
| subject_id | uuid FK→subjects    | `on delete restrict`               |
| `order`    | int not null        | explicit; CISCE renumbers          |
| name       | text not null       |                                    |
| slug       | text not null       |                                    |
| deleted_at | timestamptz null    | soft delete                        |
| created_at | timestamptz         |                                    |

**Unique**: `(subject_id, slug)`.
**Index**: `(subject_id, "order")` — listing chapters in order is on every subject page.
**FTS index**: `gin (to_tsvector('english', name))`.

### 3.4 `topics`
| column     | type                | notes                              |
| ---------- | ------------------- | ---------------------------------- |
| id         | uuid PK             |                                    |
| chapter_id | uuid FK→chapters    | `on delete restrict`               |
| `order`    | int not null        |                                    |
| name       | text not null       |                                    |
| body_md    | text                | optional descriptive markdown      |
| deleted_at | timestamptz null    |                                    |
| created_at | timestamptz         |                                    |

**Unique**: `(chapter_id, "order")` — keeps ordering stable, no accidental duplicates.
**Index**: `(chapter_id, "order")`.
**FTS index**: `gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(body_md,'')))`.

### 3.5 `cisce_circulars`
| column        | type            | notes                                |
| ------------- | --------------- | ------------------------------------ |
| id            | uuid PK         |                                      |
| title         | text not null   |                                      |
| url           | text not null   | original publish URL                 |
| sha256        | text not null   | of the PDF bytes                     |
| storage_path  | text not null   | `cisce-pdfs/<sha256>.pdf`            |
| published_at  | date            | from the document, if available      |
| ingested_at   | timestamptz not null default now()   |                 |

**Unique**: `(sha256)`.

### 3.6 `omissions`  *(the load-bearing table)*
| column             | type                                      | notes                                          |
| ------------------ | ----------------------------------------- | ---------------------------------------------- |
| id                 | uuid PK                                   |                                                |
| topic_id           | uuid FK→topics                            | `on delete restrict`                           |
| status             | text not null check in ('omitted','included','partial') | see below                       |
| source_page        | int not null check (source_page > 0)      | **citation: page in the cited circular**       |
| source_excerpt     | text not null check (length(source_excerpt) > 0) | **citation: verbatim text from PDF**     |
| cisce_circular_id  | uuid FK→cisce_circulars not null          |                                                |
| effective_session  | text not null                             | `^\d{4}-\d{2}$`, e.g. `2026-27`                |
| notes_md           | text                                      | optional human-added context                   |
| deleted_at         | timestamptz null                          |                                                |
| created_at         | timestamptz                               |                                                |

- **`status = 'partial'`** is essential: CISCE often omits only a sub-section. The UI must distinguish "whole topic gone" from "part gone."
- **Unique**: `(topic_id, effective_session)` — one omission row per topic per session.
- **Index**: `(topic_id, effective_session)` — the hottest read.
- **Index**: `(effective_session)` for the "current session" filter at scale.
- **FTS index**: `gin (to_tsvector('english', source_excerpt))`.

### 3.7 `users`
| column        | type           | notes                                       |
| ------------- | -------------- | ------------------------------------------- |
| id            | uuid PK        | == `auth.users.id`                          |
| email         | citext not null unique |                                     |
| display_name  | text           |                                             |
| role          | text not null default 'student' check in ('student','teacher','admin') |   |
| created_at    | timestamptz    |                                             |

Populated by an `auth.users` trigger on signup (`handle_new_user`).

### 3.8 `bookmarks`
| column   | type                | notes                       |
| -------- | ------------------- | --------------------------- |
| id       | uuid PK             |                             |
| user_id  | uuid FK→users       | `on delete cascade`         |
| topic_id | uuid FK→topics      | `on delete cascade`         |
| created_at | timestamptz       |                             |

**Unique**: `(user_id, topic_id)`.

### 3.9 `user_progress`
| column     | type                                       | notes                                          |
| ---------- | ------------------------------------------ | ---------------------------------------------- |
| id         | uuid PK                                    |                                                |
| user_id    | uuid FK→users                              | `on delete cascade`                            |
| topic_id   | uuid FK→topics                             | `on delete cascade`                            |
| status     | text not null check in ('not_started','in_progress','revised') |                          |
| updated_at | timestamptz not null default now()         |                                                |

**Unique**: `(user_id, topic_id)`.

### 3.10 `notes`
| column     | type                | notes                       |
| ---------- | ------------------- | --------------------------- |
| id         | uuid PK             |                             |
| user_id    | uuid FK→users       | `on delete cascade`         |
| topic_id   | uuid FK→topics      | `on delete cascade`         |
| body_md    | text not null       |                             |
| updated_at | timestamptz not null default now() |          |

### 3.11 `audit_log`
| column         | type            | notes                                            |
| -------------- | --------------- | ------------------------------------------------ |
| id             | uuid PK         |                                                  |
| actor_user_id  | uuid            | who did it (null = system/migration)             |
| entity_table   | text not null   | informational; not a real FK                     |
| entity_id      | uuid            | informational                                    |
| action         | text not null check in ('insert','update','delete','soft_delete') |        |
| change_reason  | text            | required for admin manual edits (Phase 4)        |
| diff_jsonb     | jsonb not null  | `{ before: {...}, after: {...} }`                |
| created_at     | timestamptz     |                                                  |

Populated by a generic `audit_changes()` Postgres trigger function attached to `chapters`, `topics`, `omissions`, and `users.role`.

### 3.12 Views

`v_active_chapters`, `v_active_topics`, `v_active_omissions` — pre-filter `deleted_at is null`. App reads from views; RLS policies sit on base tables.

`v_subject_counts` — per `(class_id, subject_id, effective_session)`, returns `(total_topics, omitted_topics, partial_topics)`. Backs the dashboard grid in one query.

## 4. RLS policies (concrete)

```sql
alter table classes          enable row level security;
alter table subjects         enable row level security;
alter table chapters         enable row level security;
alter table topics           enable row level security;
alter table omissions        enable row level security;
alter table cisce_circulars  enable row level security;
alter table users            enable row level security;
alter table bookmarks        enable row level security;
alter table user_progress    enable row level security;
alter table notes            enable row level security;
alter table audit_log        enable row level security;

-- Public read of taxonomy (only active rows; deleted_at filter in policy, not view, so RLS is the single source of truth)
create policy "public read classes"    on classes    for select using (true);
create policy "public read subjects"   on subjects   for select using (true);
create policy "public read chapters"   on chapters   for select using (deleted_at is null);
create policy "public read topics"     on topics     for select using (deleted_at is null);
create policy "public read omissions"  on omissions  for select using (deleted_at is null);
create policy "public read circulars"  on cisce_circulars for select using (true);

-- Admin writes on taxonomy
create policy "admin write chapters"  on chapters
  for all
  using     (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'))
  with check(exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
-- (mirror policy for: subjects, topics, omissions, cisce_circulars)

-- Self-read on users; admins read all
create policy "self read users" on users for select using (auth.uid() = id);
create policy "admin read users" on users for select
  using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- Users update their own display_name, never role
create policy "self update users" on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select u.role from users u where u.id = auth.uid()));

-- Admin updates role (logged via trigger)
create policy "admin update users" on users for update
  using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- User-owned data
create policy "own bookmarks"     on bookmarks      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress"      on user_progress  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notes"         on notes          for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- audit_log: insert only via trigger (no policy allows INSERT from clients), admin read
create policy "admin read audit" on audit_log for select
  using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
```

## 5. Triggers

- `handle_new_user()` on `auth.users` after insert → creates `public.users` row with `role='student'`.
- `audit_changes()` AFTER INSERT/UPDATE/DELETE on `chapters`, `topics`, `omissions`, `users` → inserts into `audit_log` with `actor_user_id = auth.uid()` and full row diff.
- Soft-delete trigger: an `UPDATE` that sets `deleted_at` is logged as `'soft_delete'`. A hard `DELETE` is allowed only inside a migration (admin RLS suffices because client connections never get the `service_role` key).

## 6. Migration strategy

| Migration             | Contents                                                |
| --------------------- | ------------------------------------------------------- |
| `0001_init.sql`       | All tables, indexes, RLS policies, triggers, views      |
| `0002_seed_taxonomy.sql` | Insert `classes` (9, 10) and `subjects` from `data/subjects.json` (script generates SQL) |
| `0003_seed_omissions.sql` *(Phase 1)* | Generated from `/data/omissions/**/*.json` via a Node script |

Migrations are append-only and timestamped after the first three. We use Supabase's CLI migration directory `supabase/migrations/`.

## 7. Performance notes (likely hot paths)

| Query                                                | Index used                            |
| ---------------------------------------------------- | ------------------------------------- |
| Subject dashboard counts                             | `v_subject_counts` (materialized? — decide in Phase 2 only if needed) |
| Chapters for a subject (ordered)                     | `chapters(subject_id, "order")`       |
| Topics for a chapter (ordered)                       | `topics(chapter_id, "order")`         |
| Omissions for current session                        | `omissions(topic_id, effective_session)` |
| FTS search                                           | `gin` indexes on chapters/topics/omissions |

We do **not** add a materialized view in Phase 0 — it's premature optimisation. If `v_subject_counts` is slow under real load in Phase 2, we materialise it then.

## 8. JSON ↔ DB contract

Each `/data/omissions/<class>/<subject>.json` is an array of:

```ts
{
  chapter: string;           // chapter name (matched/created)
  chapter_order: number;     // 1-based
  topic: string;             // topic name (matched/created)
  topic_order: number;       // 1-based within chapter
  status: "omitted" | "included" | "partial";
  source_page: number;       // 1-based PDF page
  source_excerpt: string;    // verbatim text, ≥ 1 char
  effective_session: string; // /^\d{4}-\d{2}$/
  notes_md?: string;
}
```

A JSON Schema lives at `schemas/omission.schema.json` and is validated in the ingest CLI before any DB write.

## 9. Open items for Phase 1

- Whether `topics.body_md` is sourced from the PDF or only added later by admins. Decision: leave nullable, populate from PDF where unambiguous (e.g. table cells under a topic heading), else admins fill in via Phase 4 UI.
- Confirm the PDF cites omissions per (class, subject) explicitly. If the PDF combines classes, we must split during ingest — logged as a discrepancy in `ingest-report.md`.
