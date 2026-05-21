#!/usr/bin/env node
/**
 * pnpm db:seed
 *
 * Reads data/omissions/{9,10}/<subject>.json and populates Supabase:
 *   cisce_circulars → subjects (lookup only) → chapters → topics → omissions
 *
 * Idempotent: deletes existing chapters/topics/omissions for each
 * subject+class before re-inserting so re-runs always produce a clean state.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS).
 */

import "dotenv/config"; // load .env.local
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.js";
import type { SubjectOmissionsFile } from "../src/types/ingest.js";

// ─── env guard ───────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌  Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
  );
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const DATA_DIR = path.join(process.cwd(), "data", "omissions");

// ─── helpers ─────────────────────────────────────────────────────────────────

function abort(msg: string, err?: unknown): never {
  console.error("❌ ", msg, err ?? "");
  process.exit(1);
}

async function upsertCircular(file: SubjectOmissionsFile): Promise<string> {
  const { data, error } = await supabase
    .from("cisce_circulars")
    .upsert(
      {
        title: `ICSE Year ${file.exam_year} — ${file.subject_name} Syllabus`,
        url: file.source_pdf_url,
        sha256: file.source_pdf_sha256,
        published_at: null,
        storage_path: null,
      },
      { onConflict: "url", ignoreDuplicates: false }
    )
    .select("id")
    .single();
  if (error || !data) abort(`upsertCircular: ${file.source_pdf_url}`, error);
  return data.id;
}

async function lookupSubject(classId: number, slug: string): Promise<string> {
  const { data, error } = await supabase
    .from("subjects")
    .select("id")
    .eq("class_id", classId)
    .eq("slug", slug)
    .single();
  if (error || !data) abort(`lookupSubject: class ${classId} slug ${slug}`, error);
  return data.id;
}

/** Delete all chapters (cascade → topics → omissions) for a subject. */
async function purgeSubject(subjectId: string): Promise<void> {
  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("subject_id", subjectId);
  if (error) abort(`purgeSubject ${subjectId}`, error);
}

async function insertChapter(
  subjectId: string,
  name: string,
  order: number
): Promise<string> {
  const { data, error } = await supabase
    .from("chapters")
    .insert({ subject_id: subjectId, name, order })
    .select("id")
    .single();
  if (error || !data) abort(`insertChapter "${name}"`, error);
  return data.id;
}

async function insertTopic(
  chapterId: string,
  name: string,
  order: number
): Promise<string> {
  const { data, error } = await supabase
    .from("topics")
    .insert({ chapter_id: chapterId, name, order })
    .select("id")
    .single();
  if (error || !data) abort(`insertTopic "${name}"`, error);
  return data.id;
}

async function insertOmission(
  topicId: string,
  circularId: string,
  entry: SubjectOmissionsFile["entries"][number]
): Promise<void> {
  const { error } = await supabase.from("omissions").insert({
    topic_id: topicId,
    status: entry.status,
    source_page: entry.source_page,
    source_excerpt: entry.source_excerpt,
    cisce_circular_id: circularId,
    effective_session: entry.effective_session,
    notes_md: entry.notes_md ?? null,
  });
  if (error) abort(`insertOmission topic ${topicId}`, error);
}

// ─── main ────────────────────────────────────────────────────────────────────

async function seedFile(filePath: string): Promise<void> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const file: SubjectOmissionsFile = JSON.parse(raw) as SubjectOmissionsFile;
  const label = `Class ${file.icse_class} / ${file.subject_name}`;

  process.stdout.write(`  ${label} ... `);

  // 1. Ensure circular exists
  const circularId = await upsertCircular(file);

  // 2. Look up subject row (seeded by 0002_seed_taxonomy.sql)
  // Build the slug from the filename stem (the file is named <slug>.json)
  const slug = path.basename(filePath, ".json");
  const subjectId = await lookupSubject(file.icse_class, slug);

  // 3. Purge then re-insert (idempotency)
  await purgeSubject(subjectId);

  // 4. Group entries by chapter (preserving order)
  const chapterMap = new Map<
    string,
    { order: number; topics: SubjectOmissionsFile["entries"] }
  >();
  for (const entry of file.entries) {
    let ch = chapterMap.get(entry.chapter);
    if (!ch) {
      ch = { order: entry.chapter_order, topics: [] };
      chapterMap.set(entry.chapter, ch);
    }
    ch.topics.push(entry);
  }

  let topicCount = 0;
  for (const [chapterName, { order: chapterOrder, topics }] of chapterMap) {
    const chapterId = await insertChapter(subjectId, chapterName, chapterOrder);
    for (const entry of topics) {
      const topicId = await insertTopic(chapterId, entry.topic, entry.topic_order);
      await insertOmission(topicId, circularId, entry);
      topicCount++;
    }
  }

  console.log(`✓  ${chapterMap.size} chapters, ${topicCount} topics`);
}

async function main(): Promise<void> {
  console.log("\n[db:seed] Seeding Supabase from data/omissions/**/*.json\n");

  const classDirs = fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let fileCount = 0;
  for (const classDir of classDirs) {
    const dir = path.join(DATA_DIR, classDir);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort();

    for (const file of files) {
      await seedFile(path.join(dir, file));
      fileCount++;
    }
  }

  console.log(`\n✅  Seeded ${fileCount} files successfully.\n`);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("[db:seed] Fatal:", msg);
  process.exit(1);
});
