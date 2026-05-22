import Link from "next/link";
import type { SubjectSummary } from "@/lib/data";

interface SubjectCardProps {
  subject: SubjectSummary;
  icseClass: 9 | 10;
}

export function SubjectCard({ subject, icseClass }: SubjectCardProps) {
  const hasRemovals = subject.omittedCount > 0 || subject.partialCount > 0;

  return (
    <Link
      href={`/class/${icseClass}/subject/${subject.slug}`}
      className="group block glass-card rounded-lg p-5 hover:border-primary/30 transition-all duration-500"
    >
      {/* Group label + subject name */}
      <div className="min-w-0">
        <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/40 font-light">
          Group {subject.group}
        </span>
        <h2 className="font-display text-base font-light mt-0.5 text-card-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
          {subject.name}
        </h2>
      </div>

      {/* Status indicators — border-only, editorial */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {subject.omittedCount > 0 && (
          <span
            className="inline-flex items-center rounded border border-destructive/25 text-destructive/80 px-2 py-0.5 text-[10px] tracking-wider font-light"
            aria-label={`${subject.omittedCount} topics omitted`}
          >
            {subject.omittedCount} omitted
          </span>
        )}
        {subject.partialCount > 0 && (
          <span
            className="inline-flex items-center rounded border border-amber-500/25 text-amber-700/80 dark:text-amber-400/70 px-2 py-0.5 text-[10px] tracking-wider font-light"
            aria-label={`${subject.partialCount} topics partial`}
          >
            {subject.partialCount} partial
          </span>
        )}
        {!hasRemovals && (
          <span className="inline-flex items-center rounded border border-border/40 text-muted-foreground/40 px-2 py-0.5 text-[10px] tracking-wider font-light">
            Full syllabus
          </span>
        )}
      </div>

      {/* Topic count */}
      <div className="mt-3 text-[10px] text-muted-foreground/40 tracking-wide font-light">
        {subject.chapterCount} chapters · {subject.entryCount} topics
      </div>
    </Link>
  );
}
