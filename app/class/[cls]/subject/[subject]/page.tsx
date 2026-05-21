import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Printer } from "lucide-react";
import { getSubjectChapters } from "@/lib/data";
import { getSubjectMeta } from "@/lib/subjects";
import { chapterToSlug } from "@/lib/utils";

interface Props {
  params: Promise<{ cls: string; subject: string }>;
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
    title: `${meta?.name ?? subject} — Class ${icseClass}`,
  };
}

export default async function SubjectPage({ params }: Props) {
  const { cls, subject: subjectSlug } = await params;
  const icseClass = parseClass(cls);
  const result = getSubjectChapters(icseClass, subjectSlug);
  if (!result) notFound();

  const { subject, chapters } = result;
  const meta = getSubjectMeta(subjectSlug);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href={`/class/${icseClass}`} className="hover:text-foreground transition-colors">
          Class {icseClass}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-foreground font-medium">{meta?.name ?? subject.subject_name}</span>
      </nav>

      <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{meta?.name ?? subject.subject_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Class {icseClass} · {chapters.length} chapters · {subject.entries.length} topics
          </p>
        </div>
        <Link
          href={`/class/${icseClass}/subject/${subjectSlug}/print`}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          aria-label="Open printable revision checklist for this subject"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden />
          Print checklist
        </Link>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => (
          <Link
            key={chapter.name}
            href={`/class/${icseClass}/subject/${subjectSlug}/${chapterToSlug(chapter.name)}`}
            className="group block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {chapter.order}
                </span>
                <h2 className="font-medium text-card-foreground group-hover:text-primary transition-colors truncate">
                  {chapter.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{chapter.topics.length} topics</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden />
              </div>
            </div>

            {/* Preview of first 2 topics */}
            <ul className="mt-2 ml-10 space-y-0.5" aria-label={`Topics in ${chapter.name}`}>
              {chapter.topics.slice(0, 2).map((t) => (
                <li key={t.topic} className="text-xs text-muted-foreground truncate">
                  {t.topic}
                </li>
              ))}
              {chapter.topics.length > 2 && (
                <li className="text-xs text-muted-foreground/60">
                  +{chapter.topics.length - 2} more…
                </li>
              )}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
