-- ============================================================
-- 0001_init.sql — ICSE Omissions Platform schema
-- Apply via: supabase db push  (or psql -f 0001_init.sql)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- fast LIKE / trigram search

-- ============================================================
-- Core taxonomy
-- ============================================================

create table if not exists classes (
  id   smallint primary key,
  name text     not null  -- e.g. "Class 9"
);
insert into classes values (9, 'Class 9'), (10, 'Class 10')
  on conflict do nothing;

create table if not exists subjects (
  id         uuid    primary key default uuid_generate_v4(),
  class_id   smallint not null references classes(id),
  code       text    not null,
  name       text    not null,
  slug       text    not null,
  subject_group text not null,       -- "I", "II", "III"
  unique (class_id, slug)
);

create table if not exists chapters (
  id         uuid    primary key default uuid_generate_v4(),
  subject_id uuid    not null references subjects(id) on delete cascade,
  "order"    int     not null,
  name       text    not null,
  deleted_at timestamptz,
  unique (subject_id, "order")
);

create table if not exists topics (
  id         uuid    primary key default uuid_generate_v4(),
  chapter_id uuid    not null references chapters(id) on delete cascade,
  "order"    int     not null,
  name       text    not null,
  body_md    text,
  deleted_at timestamptz,
  unique (chapter_id, "order")
);

-- ============================================================
-- Omissions / inclusion status
-- ============================================================

create type omission_status as enum ('omitted', 'included', 'partial');

create table if not exists cisce_circulars (
  id           uuid    primary key default uuid_generate_v4(),
  title        text    not null,
  url          text    not null unique,
  sha256       text    not null,
  published_at date,
  storage_path text,
  created_at   timestamptz not null default now()
);

create table if not exists omissions (
  id                 uuid    primary key default uuid_generate_v4(),
  topic_id           uuid    not null references topics(id) on delete cascade,
  status             omission_status not null default 'included',
  source_page        int     not null,
  source_excerpt     text    not null,
  cisce_circular_id  uuid    references cisce_circulars(id),
  effective_session  text    not null,               -- e.g. "2027-28"
  notes_md           text,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Hottest query: "is this topic omitted this session?"
create index if not exists omissions_topic_session
  on omissions (topic_id, effective_session)
  where deleted_at is null;

-- Full-text search on source excerpts
create index if not exists omissions_excerpt_fts
  on omissions using gin (to_tsvector('english', source_excerpt));

-- FTS on chapter / topic names
create index if not exists chapters_name_fts
  on chapters using gin (to_tsvector('english', name));
create index if not exists topics_name_fts
  on topics using gin (to_tsvector('english', name));

-- ============================================================
-- User tables (populated when auth is wired up in Phase 3)
-- ============================================================

create table if not exists users (
  id           uuid    primary key,   -- = auth.uid()
  email        text    not null unique,
  display_name text,
  role         text    not null default 'student'
                check (role in ('student', 'teacher', 'admin')),
  created_at   timestamptz not null default now()
);

create table if not exists bookmarks (
  id         uuid    primary key default uuid_generate_v4(),
  user_id    uuid    not null references users(id) on delete cascade,
  topic_id   uuid    not null references topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create table if not exists user_progress (
  id         uuid    primary key default uuid_generate_v4(),
  user_id    uuid    not null references users(id) on delete cascade,
  topic_id   uuid    not null references topics(id) on delete cascade,
  status     text    not null default 'not_started'
               check (status in ('not_started', 'in_progress', 'revised')),
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create table if not exists notes (
  id         uuid    primary key default uuid_generate_v4(),
  user_id    uuid    not null references users(id) on delete cascade,
  topic_id   uuid    not null references topics(id) on delete cascade,
  body_md    text    not null,
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

-- ============================================================
-- Audit log
-- ============================================================

create table if not exists audit_log (
  id             uuid    primary key default uuid_generate_v4(),
  actor_user_id  uuid    references users(id),
  entity_table   text    not null,
  entity_id      uuid    not null,
  action         text    not null check (action in ('insert', 'update', 'delete')),
  change_reason  text,
  diff_jsonb     jsonb,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- Active-record views (filter soft-deleted rows)
-- ============================================================

create or replace view v_active_chapters as
  select * from chapters where deleted_at is null;

create or replace view v_active_topics as
  select * from topics where deleted_at is null;

create or replace view v_active_omissions as
  select * from omissions where deleted_at is null;

create or replace view v_subject_counts as
  select
    s.id,
    s.class_id,
    s.name,
    s.slug,
    count(distinct c.id) as chapter_count,
    count(distinct t.id) as topic_count
  from subjects s
  left join chapters c on c.subject_id = s.id and c.deleted_at is null
  left join topics   t on t.chapter_id = c.id and t.deleted_at is null
  group by s.id;

-- ============================================================
-- Trigger: updated_at auto-update
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger omissions_updated_at
  before update on omissions
  for each row execute function set_updated_at();

create trigger user_progress_updated_at
  before update on user_progress
  for each row execute function set_updated_at();

create trigger notes_updated_at
  before update on notes
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Enable RLS on all tables
alter table subjects       enable row level security;
alter table chapters       enable row level security;
alter table topics         enable row level security;
alter table omissions      enable row level security;
alter table cisce_circulars enable row level security;
alter table users          enable row level security;
alter table bookmarks      enable row level security;
alter table user_progress  enable row level security;
alter table notes          enable row level security;
alter table audit_log      enable row level security;

-- Public read (no auth required for taxonomy + omission data)
create policy "public read subjects"        on subjects        for select using (true);
create policy "public read chapters"        on chapters        for select using (deleted_at is null);
create policy "public read topics"          on topics          for select using (deleted_at is null);
create policy "public read omissions"       on omissions       for select using (deleted_at is null);
create policy "public read circulars"       on cisce_circulars for select using (true);

-- Users can read/update their own profile
create policy "own user row" on users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Bookmarks, progress, notes: owner-only
create policy "own bookmarks" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own progress" on user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin-only writes on taxonomy + omissions
create policy "admin write chapters" on chapters
  for insert with check (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
create policy "admin update chapters" on chapters
  for update using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
create policy "admin write topics" on topics
  for insert with check (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
create policy "admin update topics" on topics
  for update using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
create policy "admin write omissions" on omissions
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
create policy "admin write circulars" on cisce_circulars
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Audit log: insert via trigger only; admin can read
create policy "admin read audit_log" on audit_log
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
