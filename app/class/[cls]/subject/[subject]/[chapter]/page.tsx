import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Printer } from "lucide-react";
import { getChapterDetail, listSubjectSummaries, getSubjectChapters } from "@/lib/data";
import { getSubjectMeta } from "@/lib/subjects";
import { Badge } from "@/components/ui/badge";
import { SourceCitation } from "@/components/source-citation";
import { TopicControls } from "@/components/topic-controls";
import { AnimatedTopicList } from "@/components/animated-topic-list";
import type { OmissionStatus } from "@/types/ingest";

export function generateStaticParams() {
  const params: { cls: string; subject: string; chapter: string }[] = [];
  for (const cls of ["9", "10"] as const) {
    for (const s of listSubjectSummaries(Number(cls) as 9 | 10)) {
      const result = getSubjectChapters(Number(cls) as 9 | 10, s.slug);
      if (!result) continue;
      for (const ch of result.chapters) {
        // Return decoded slug (Next.js URL-decodes params before passing to the component)
        params.push({
          cls,
          subject: s.slug,
          // Case is preserved to match chapterToSlug (see src/lib/utils.ts)
          chapter: ch.name.replace(/\s+/g, "-"),
        });
      }
    }
  }
  return params;
}

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
  const subjectName = getSubjectMeta(subject)?.name ?? subject;
  const omittedCount = result.chapter.topics.filter((t) => t.status === "omitted").length;
  const partialCount = result.chapter.topics.filter((t) => t.status === "partial").length;
  const totalTopics = result.chapter.topics.length;
  const omissionNote =
    omittedCount + partialCount > 0
      ? ` ${omittedCount + partialCount} of ${totalTopics} topics omitted or reduced for 2027-28.`
      : ` All ${totalTopics} topics included for 2027-28.`;
  return {
    title: `${result.chapter.name} — ${subjectName} Class ${icseClass}`,
    description: `ICSE Class ${icseClass} ${subjectName} — ${result.chapter.name}.${omissionNote} Every entry cites the official CISCE PDF page.`,
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
      {/* Breadcrumb — editorial citation style */}
      <nav
        className="flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 font-light mb-8 flex-wrap print:hidden"
        aria-label="Breadcrumb"
      >
        <Link href={`/class/${icseClass}`} className="hover:text-foreground transition-colors">
          Class {icseClass}
        </Link>
        <span aria-hidden className="mx-1 text-muted-foreground/20">·</span>
        <Link
          href={`/class/${icseClass}/subject/${subjectSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {subjectName}
        </Link>
        <span aria-hidden className="mx-1 text-muted-foreground/20">·</span>
        <span className="text-foreground/60">{chapter.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <span
              className="flex h-8 w-8 items-center justify-center rounded border border-primary/20 bg-primary/5 text-primary/70 text-xs font-light shrink-0"
              aria-hidden
            >
              {chapter.order}
            </span>
            <h1 className="font-display text-2xl font-light tracking-tight">{chapter.name}</h1>
          </div>
          {/* Print checklist link */}
          <Link
            href={`/class/${icseClass}/subject/${subjectSlug}/print`}
            className="print:hidden flex items-center gap-1.5 rounded border border-border/50 px-3 py-1.5 text-[10px] tracking-wider uppercase font-light text-muted-foreground/60 hover:text-foreground hover:border-border transition-all duration-300"
            aria-label="Open printable checklist for this subject"
          >
            <Printer className="h-3 w-3" aria-hidden />
            Print
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 ml-12 text-xs text-muted-foreground/50 font-light">
          <span>{chapter.topics.length} topics</span>
          {omittedCount > 0 && (
            <span className="text-destructive/70">{omittedCount} omitted</span>
          )}
          {partialCount > 0 && (
            <span className="text-amber-600/70 dark:text-amber-400/60">{partialCount} partial</span>
          )}
          <span>
            ICSE Class {icseClass} · {subjectName}
          </span>
        </div>
      </div>

      {/* Source PDF link */}
      <div className="flex items-center gap-2 mb-8 pl-4 border-l border-border/40 print:hidden">
        <FileText className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" aria-hidden />
        <span className="text-xs text-muted-foreground/50 font-light">
          Source:{" "}
          <a
            href={subject.source_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
            aria-label="Open official CISCE syllabus PDF (opens in new tab)"
          >
            Official CISCE Syllabus PDF
          </a>
          {" — "}every topic is cited to a specific page.
        </span>
      </div>

      {/* Legend */}
      {(omittedCount > 0 || partialCount > 0) && (
        <div
          className="flex flex-wrap items-center gap-4 mb-6 text-[10px] text-muted-foreground/40 font-light tracking-wide print:hidden"
          aria-label="Status legend"
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border border-dashed border-red-400/60" aria-hidden />
            Omitted — removed from 2027-28 syllabus
          </span>
          {partialCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border border-dashed border-amber-400/60" aria-hidden />
              Partial — sub-section removed
            </span>
          )}
        </div>
      )}

      <AnimatedTopicList ariaLabel="Topics in this chapter">
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
                  className="shrink-0 flex h-6 w-6 items-center justify-center rounded border border-border/40 text-muted-foreground/40 text-[10px] font-light mt-0.5"
                  aria-hidden
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`font-light leading-snug ${TOPIC_TEXT_CLASS[status]}`}>
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
      </AnimatedTopicList>
    </div>
  );
}
