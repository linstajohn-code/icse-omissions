import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, FileText, Printer } from "lucide-react";
import { getChapterDetail } from "@/lib/data";
import { getSubjectMeta } from "@/lib/subjects";
import { Badge } from "@/components/ui/badge";
import { SourceCitation } from "@/components/source-citation";
import { TopicControls } from "@/components/topic-controls";
import type { OmissionStatus } from "@/types/ingest";

interface Props {
  params: Promise<{ cls: string; subject: string; chapter: string }>;
}

function parseClass(cls: string): 9 | 10 {
  if (cls === "9") return 9;
  if (cls === "10") return 10;
  return notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cls, subject, chapter } = await params;
  const icseClass = parseClass(cls);
  const result = getChapterDetail(icseClass, subject, chapter);
  if (!result) return {};
  return {
    title: `${result.chapter.name} — ${getSubjectMeta(subject)?.name ?? subject} Class ${icseClass}`,
  };
}

const STATUS_LABEL: Record<OmissionStatus, string> = {
  included: "Included",
  omitted: "Omitted",
  partial: "Partial",
};

/**
 * Card styling per status — combines background tint + border + text treatment
 * so the difference is never conveyed by colour alone (a11y requirement).
 *
 *  omitted  → red tint + dashed border + strikethrough topic name
 *  partial  → amber tint + dashed border + normal name
 *  included → default card (no extra treatment needed)
 */
const CARD_CLASS: Record<OmissionStatus, string> = {
  omitted:
    "border-dashed border-red-300 bg-red-50/40 dark:border-red-800/60 dark:bg-red-950/20",
  partial:
    "border-dashed border-amber-300 bg-amber-50/40 dark:border-amber-800/60 dark:bg-amber-950/20",
  included: "border-border bg-card",
};

const TOPIC_TEXT_CLASS: Record<OmissionStatus, string> = {
  omitted: "line-through text-muted-foreground",
  partial: "text-card-foreground",
  included: "text-card-foreground",
};

export default async function ChapterPage({ params }: Props) {
  const { cls, subject: subjectSlug, chapter: chapterSlug } = await params;
  const icseClass = parseClass(cls);
  const result = getChapterDetail(icseClass, subjectSlug, chapterSlug);
  if (!result) notFound();

  const { chapter, subject } = result;
  const meta = getSubjectMeta(subjectSlug);
  const subjectName = meta?.name ?? subject.subject_name;

  const omittedCount = chapter.topics.filter((t) => t.status === "omitted").length;
  const partialCount = chapter.topics.filter((t) => t.status === "partial").length;

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap print:hidden"
        aria-label="Breadcrumb"
      >
        <Link
          href={`/class/${icseClass}`}
          className="hover:text-foreground transition-colors"
        >
          Class {icseClass}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link
          href={`/class/${icseClass}/subject/${subjectSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {subjectName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-foreground font-medium">{chapter.name}</span>
      </nav>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0"
              aria-hidden
            >
              {chapter.order}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{chapter.name}</h1>
          </div>
          {/* Print checklist link */}
          <Link
            href={`/class/${icseClass}/subject/${subjectSlug}/print`}
            className="print:hidden flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Open printable checklist for this subject"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Print checklist
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 ml-11 text-sm text-muted-foreground">
          <span>{chapter.topics.length} topics</span>
          {omittedCount > 0 && (
            <span className="text-destructive font-medium">
              {omittedCount} omitted
            </span>
          )}
          {partialCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {partialCount} partial
            </span>
          )}
          <span>
            ICSE Class {icseClass} · {subjectName}
          </span>
        </div>
      </div>

      {/* Source PDF link */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/40 border border-border text-sm print:hidden">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <span className="text-muted-foreground">
          Source:{" "}
          <a
            href={subject.source_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            aria-label="Open official CISCE syllabus PDF (opens in new tab)"
          >
            Official CISCE Syllabus PDF
          </a>
          {" — "}every topic below is cited to a specific page.
        </span>
      </div>

      {/* Legend */}
      {(omittedCount > 0 || partialCount > 0) && (
        <div
          className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground print:hidden"
          aria-label="Status legend"
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm border-2 border-dashed border-red-400" aria-hidden />
            Omitted — topic removed from 2027-28 syllabus
          </span>
          {partialCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm border-2 border-dashed border-amber-400" aria-hidden />
              Partial — only a sub-section removed
            </span>
          )}
        </div>
      )}

      <ol className="space-y-4" aria-label="Topics in this chapter">
        {chapter.topics.map((topic, idx) => {
          const topicKey = `${icseClass}/${subjectSlug}/${chapter.order}/${topic.topic_order}`;
          const status = topic.status as OmissionStatus;

          return (
            <li
              key={topic.topic}
              id={`topic-${topic.topic_order}`}
              className={`rounded-lg border p-4 scroll-mt-20 ${CARD_CLASS[status]}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium mt-0.5"
                  aria-hidden
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p
                      className={`font-medium leading-snug ${TOPIC_TEXT_CLASS[status]}`}
                    >
                      {topic.topic}
                    </p>
                    <Badge
                      variant={status}
                      aria-label={`Status: ${STATUS_LABEL[status]}`}
                    >
                      {STATUS_LABEL[status]}
                    </Badge>
                  </div>
                  <SourceCitation
                    pdfUrl={subject.source_pdf_url}
                    sourcePage={topic.source_page}
                    sourceExcerpt={topic.source_excerpt}
                  />
                  {/* Personalization controls — renders only when user is signed in */}
                  <TopicControls topicKey={topicKey} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
