import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, FileText } from "lucide-react";
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

export default async function ChapterPage({ params }: Props) {
  const { cls, subject: subjectSlug, chapter: chapterSlug } = await params;
  const icseClass = parseClass(cls);
  const result = getChapterDetail(icseClass, subjectSlug, chapterSlug);
  if (!result) notFound();

  const { chapter, subject } = result;
  const meta = getSubjectMeta(subjectSlug);
  const subjectName = meta?.name ?? subject.subject_name;

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap"
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
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {chapter.order}
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{chapter.name}</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-2 ml-11">
          {chapter.topics.length} topics · ICSE Class {icseClass} · {subjectName}
        </p>
      </div>

      {/* Source PDF link */}
      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-muted/40 border border-border text-sm">
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

      <ol className="space-y-4" aria-label="Topics in this chapter">
        {chapter.topics.map((topic, idx) => {
          // Natural key for personalization API: "{class}/{subjectSlug}/{chapterOrder}/{topicOrder}"
          const topicKey = `${icseClass}/${subjectSlug}/${chapter.order}/${topic.topic_order}`;

          return (
            <li key={topic.topic} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium mt-0.5"
                  aria-hidden
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-medium text-card-foreground leading-snug">
                      {topic.topic}
                    </p>
                    <Badge
                      variant={topic.status as OmissionStatus}
                      aria-label={`Status: ${STATUS_LABEL[topic.status]}`}
                    >
                      {STATUS_LABEL[topic.status]}
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
