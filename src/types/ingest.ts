/**
 * Shared types for the CISCE ingest pipeline.
 * These are the canonical contracts between pdf-extractor, syllabus-parser,
 * and the JSON output files.
 */

export type OmissionStatus = "omitted" | "included" | "partial";

/** Represents one page from a PDF. pageNum is 1-based. */
export interface PdfPage {
  pageNum: number;
  text: string;
}

/** One topic entry in the per-subject output JSON. */
export interface OmissionEntry {
  chapter: string;
  chapter_order: number;
  topic: string;
  topic_order: number;
  status: OmissionStatus;
  source_page: number;
  source_excerpt: string;
  effective_session: string; // e.g. "2027-28"
  notes_md?: string;
}

/** Top-level structure of each /data/omissions/<class>/<subject>.json file. */
export interface SubjectOmissionsFile {
  subject_code: string; // e.g. "51"
  subject_name: string; // e.g. "Mathematics"
  icse_class: 9 | 10;
  exam_year: number; // e.g. 2028
  effective_session: string; // e.g. "2027-28"
  source_pdf_url: string;
  source_pdf_sha256: string;
  ingested_at: string; // ISO timestamp
  entries: OmissionEntry[];
}

/** Summary of one parse pass — written to ingest-report.md. */
export interface ParseReport {
  pdfPath: string;
  subjectName: string;
  totalPages: number;
  chaptersFound: number;
  topicsFound: number;
  unparsedSections: UnparsedSection[];
  warnings: string[];
}

export interface UnparsedSection {
  pageNum: number;
  reason: string;
  rawExcerpt: string;
}
