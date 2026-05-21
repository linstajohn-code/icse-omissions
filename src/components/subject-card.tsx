import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { SubjectSummary } from "@/lib/data";

interface SubjectCardProps {
  subject: SubjectSummary;
  icseClass: 9 | 10;
}

export function SubjectCard({ subject, icseClass }: SubjectCardProps) {
  return (
    <Link
      href={`/class/${icseClass}/subject/${subject.slug}`}
      className="group block rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden />
          <h2 className="font-medium text-card-foreground text-sm truncate group-hover:text-primary transition-colors">
            {subject.name}
          </h2>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          Group {subject.group}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{subject.chapterCount} chapters</span>
        <span aria-hidden>·</span>
        <span>{subject.entryCount} topics</span>
      </div>
    </Link>
  );
}
