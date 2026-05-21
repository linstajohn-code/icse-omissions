import Link from "next/link";
import { BookOpen } from "lucide-react";
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
      className="group block rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen
            className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors"
            aria-hidden
          />
          <h2 className="font-medium text-card-foreground text-sm truncate group-hover:text-primary transition-colors">
            {subject.name}
          </h2>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          Gr {subject.group}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {subject.omittedCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">
            <span aria-hidden className="text-[10px]">✕</span>
            {subject.omittedCount} omitted
          </span>
        )}
        {subject.partialCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-xs font-medium">
            <span aria-hidden className="text-[10px]">◐</span>
            {subject.partialCount} partial
          </span>
        )}
        {!hasRemovals && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
            Full syllabus
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {subject.chapterCount} chapters · {subject.entryCount} topics
      </div>
    </Link>
  );
}
