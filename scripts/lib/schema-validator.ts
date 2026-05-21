import { z } from "zod";
import type { OmissionEntry, SubjectOmissionsFile } from "../../src/types/ingest.js";

const OmissionEntrySchema = z.object({
  chapter: z.string().min(1),
  chapter_order: z.number().int().positive(),
  topic: z.string().min(1),
  topic_order: z.number().int().positive(),
  status: z.enum(["omitted", "included", "partial"]),
  source_page: z.number().int().positive(),
  source_excerpt: z.string().min(1),
  effective_session: z.string().regex(/^\d{4}-\d{2}$/),
  notes_md: z.string().optional(),
});

const SubjectOmissionsFileSchema = z.object({
  subject_code: z.string().min(1),
  subject_name: z.string().min(1),
  icse_class: z.union([z.literal(9), z.literal(10)]),
  exam_year: z.number().int().positive(),
  effective_session: z.string().regex(/^\d{4}-\d{2}$/),
  source_pdf_url: z.string().url(),
  source_pdf_sha256: z.string().length(64),
  ingested_at: z.string().datetime(),
  entries: z.array(OmissionEntrySchema).min(1),
});

export function validateEntry(entry: unknown): OmissionEntry {
  return OmissionEntrySchema.parse(entry);
}

export function validateSubjectFile(data: unknown): SubjectOmissionsFile {
  return SubjectOmissionsFileSchema.parse(data);
}
