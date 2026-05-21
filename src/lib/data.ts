import fs from "node:fs";
import path from "node:path";
import type { OmissionEntry, SubjectOmissionsFile } from "@/types/ingest";
import { SUBJECTS, type SubjectMeta } from "./subjects";

const DATA_DIR = path.join(process.cwd(), "data", "omissions");

function readJson(icseClass: 9 | 10, slug: string): SubjectOmissionsFile | null {
  const filePath = path.join(DATA_DIR, String(icseClass), `${slug}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as SubjectOmissionsFile;
  } catch {
    return null;
  }
}

export interface SubjectSummary extends SubjectMeta {
  entryCount: number;
  chapterCount: number;
}

export function listSubjectSummaries(icseClass: 9 | 10): SubjectSummary[] {
  return SUBJECTS.flatMap((meta) => {
    const data = readJson(icseClass, meta.slug);
    if (!data) return [];
    const chapters = new Set(data.entries.map((e) => e.chapter));
    return [{ ...meta, entryCount: data.entries.length, chapterCount: chapters.size }];
  });
}

export interface ChapterWithTopics {
  name: string;
  order: number;
  topics: OmissionEntry[];
}

export function getSubjectChapters(
  icseClass: 9 | 10,
  slug: string
): { subject: SubjectOmissionsFile; chapters: ChapterWithTopics[] } | null {
  const subject = readJson(icseClass, slug);
  if (!subject) return null;

  const chapterMap = new Map<string, ChapterWithTopics>();
  for (const entry of subject.entries) {
    let ch = chapterMap.get(entry.chapter);
    if (!ch) {
      ch = { name: entry.chapter, order: entry.chapter_order, topics: [] };
      chapterMap.set(entry.chapter, ch);
    }
    ch.topics.push(entry);
  }

  const chapters = [...chapterMap.values()].sort((a, b) => a.order - b.order);
  return { subject, chapters };
}

export function getChapterDetail(
  icseClass: 9 | 10,
  slug: string,
  chapterSlug: string
): { chapter: ChapterWithTopics; subject: SubjectOmissionsFile } | null {
  const result = getSubjectChapters(icseClass, slug);
  if (!result) return null;
  const chapterName = decodeURIComponent(chapterSlug).replace(/-/g, " ");
  const chapter = result.chapters.find(
    (c) => c.name.toLowerCase() === chapterName.toLowerCase()
  );
  if (!chapter) return null;
  return { chapter, subject: result.subject };
}

export function searchEntries(
  query: string,
  icseClass?: 9 | 10
): Array<OmissionEntry & { subjectSlug: string; subjectName: string; icseClass: 9 | 10 }> {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const classes: (9 | 10)[] = icseClass ? [icseClass] : [9, 10];
  const results: Array<OmissionEntry & { subjectSlug: string; subjectName: string; icseClass: 9 | 10 }> = [];

  for (const cls of classes) {
    for (const meta of SUBJECTS) {
      const data = readJson(cls, meta.slug);
      if (!data) continue;
      for (const entry of data.entries) {
        if (
          entry.chapter.toLowerCase().includes(q) ||
          entry.topic.toLowerCase().includes(q) ||
          entry.source_excerpt.toLowerCase().includes(q)
        ) {
          results.push({ ...entry, subjectSlug: meta.slug, subjectName: meta.name, icseClass: cls });
          if (results.length >= 50) return results;
        }
      }
    }
  }
  return results;
}
