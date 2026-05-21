/**
 * /class/[cls]/subject/[subject]/print — printable revision checklist.
 *
 * Shows all chapters + topics for a subject.
 * Omitted/partial topics are visually distinct.
 * No nav, no auth controls, no theme toggle.
 *
 * ?mode=omitted — shows ONLY omitted + partial topics (shorter printout).
 * Default        — shows ALL topics (full revision checklist with checkboxes).
 *
 * Uses Tailwind's print: variants + an inline <style> for print-specific CSS.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSubjectChapters } from "@/lib/data";
import { getSubjectMeta } from "@/lib/subjects";
import { PrintButton } from "@/components/print-button";
import type { OmissionStatus } from "@/types/ingest";

interface Props {
  params: Promise<{ cls: string; subject: string }>;
  searchParams: Promise<{ mode?: string }>;
}

function parseClass(cls: string): 9 | 10 {
  if (cls === "9") return 9;
  if (cls === "10") return 10;
  return notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cls, subject } = await params;
  const icseClass = parseClass(cls);
  const meta = getSubjectMeta(subject);
  return {
    title: `${meta?.name ?? subject} Class ${icseClass} — Revision Checklist`,
  };
}

const STATUS_SYMBOL: Record<OmissionStatus, string> = {
  omitted: "✕",
  partial: "◐",
  included: "☐",
};

const STATUS_LABEL: Record<OmissionStatus, string> = {
  omitted: "Omitted",
  partial: "Partial",
  included: "Included",
};

export default async function PrintPage({ params, searchParams }: Props) {
  const { cls, subject: subjectSlug } = await params;
  const { mode } = await searchParams;
  const icseClass = parseClass(cls);
  const omittedOnly = mode === "omitted";

  const result = getSubjectChapters(icseClass, subjectSlug);
  if (!result) notFound();

  const { subject, chapters } = result;
  const meta = getSubjectMeta(subjectSlug);
  const subjectName = meta?.name ?? subject.subject_name;

  // Compute totals
  const allTopics = chapters.flatMap((c) => c.topics);
  const omittedCount = allTopics.filter((t) => t.status === "omitted").length;
  const partialCount = allTopics.filter((t) => t.status === "partial").length;

  // Filter chapters for omitted-only mode
  const displayChapters = chapters
    .map((ch) => ({
      ...ch,
      topics: omittedOnly
        ? ch.topics.filter(
            (t) => t.status === "omitted" || t.status === "partial"
          )
        : ch.topics,
    }))
    .filter((ch) => ch.topics.length > 0);

  const today = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  });

  return (
    <>
      {/* Print-specific CSS */}
      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { font-size: 11pt; }
          .page-break { page-break-after: always; break-after: page; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
        {/* Header — screen only */}
        <div className="print:hidden flex items-center justify-between gap-4 flex-wrap">
          <Link
            href={`/class/${icseClass}/subject/${subjectSlug}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {subjectName}
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle between all topics and omitted-only */}
            <Link
              href={`/class/${icseClass}/subject/${subjectSlug}/print${omittedOnly ? "" : "?mode=omitted"}`}
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            >
              {omittedOnly ? "Show all topics" : "Omissions only"}
            </Link>
            <PrintButton />
          </div>
        </div>

        {/* Print document title */}
        <div className="border-b pb-4">
          <p className="text-xs text-muted-foreground mb-1">
            ICSE Class {icseClass} · Session 2027-28 · Printed {today}
          </p>
          <h1 className="text-2xl font-bold">{subjectName}</h1>
          <p className="text-sm font-semibold mt-0.5">
            {omittedOnly ? "Omissions Checklist" : "Revision Checklist"}
          </p>

          {/* Summary */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span>{allTopics.length} total topics</span>
            <span className="text-destructive font-medium">
              {omittedCount} omitted
            </span>
            {partialCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {partialCount} partial
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground print:gap-8">
          <span>
            <strong>☐</strong> Included — study this
          </span>
          <span>
            <strong>✕</strong> Omitted — skip for 2027-28 exams
          </span>
          <span>
            <strong>◐</strong> Partial — only part is omitted (see notes)
          </span>
        </div>

        {/* Chapters */}
        {displayChapters.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No omissions found for this subject in 2027-28.
          </p>
        ) : (
          <div className="space-y-6">
            {displayChapters.map((chapter, chIdx) => (
              <section key={chapter.name} aria-label={`Chapter: ${chapter.name}`}>
                {/* Chapter header */}
                <div className="flex items-center gap-2 mb-2 pb-1 border-b">
                  <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
                    {chapter.order}.
                  </span>
                  <h2 className="font-bold text-base">{chapter.name}</h2>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {chapter.topics.length} topics
                  </span>
                </div>

                {/* Topics */}
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {chapter.topics.map((topic) => {
                      const status = topic.status as OmissionStatus;
                      const isRemoved =
                        status === "omitted" || status === "partial";
                      return (
                        <tr
                          key={topic.topic}
                          className={
                            isRemoved
                              ? "bg-red-50/50 dark:bg-red-950/10 print:bg-transparent"
                              : ""
                          }
                        >
                          {/* Symbol */}
                          <td
                            className="w-6 pr-2 py-1.5 text-center font-bold text-xs align-top"
                            aria-label={STATUS_LABEL[status]}
                          >
                            <span
                              className={
                                status === "omitted"
                                  ? "text-destructive"
                                  : status === "partial"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                              }
                            >
                              {STATUS_SYMBOL[status]}
                            </span>
                          </td>

                          {/* Topic number */}
                          <td className="w-10 py-1.5 text-xs text-muted-foreground font-mono align-top pr-2">
                            {chapter.order}.{topic.topic_order}
                          </td>

                          {/* Topic name */}
                          <td
                            className={`py-1.5 align-top leading-snug ${
                              status === "omitted"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {topic.topic}
                            {topic.notes_md && (
                              <span className="ml-2 text-xs text-muted-foreground not-italic">
                                — {topic.notes_md}
                              </span>
                            )}
                          </td>

                          {/* Source page */}
                          <td className="w-16 py-1.5 text-xs text-muted-foreground text-right align-top">
                            p.{topic.source_page}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Page break hint after every 2 chapters when printing */}
                {chIdx > 0 && chIdx % 4 === 0 && (
                  <div className="page-break hidden print:block" />
                )}
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 text-xs text-muted-foreground print:mt-8">
          <p>
            Source:{" "}
            <a
              href={subject.source_pdf_url}
              className="text-primary underline print:text-foreground"
            >
              {subject.source_pdf_url}
            </a>
          </p>
          <p className="mt-1">
            Data from official CISCE circular — verify against the original PDF
            before your examination.
          </p>
        </div>
      </div>
    </>
  );
}
