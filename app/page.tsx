/**
 * Homepage — exam countdown + class entry points.
 *
 * Replaces the old instant redirect to /class/9.
 */
import Link from "next/link";
import { listSubjectSummaries } from "@/lib/data";
import { ExamCountdown } from "@/components/exam-countdown";

function computeStats(cls: 9 | 10) {
  const subjects = listSubjectSummaries(cls);
  return {
    subjects: subjects.length,
    topics: subjects.reduce((n, s) => n + s.entryCount, 0),
    omitted: subjects.reduce((n, s) => n + s.omittedCount, 0),
    partial: subjects.reduce((n, s) => n + s.partialCount, 0),
  };
}

export default function HomePage() {
  const stats9 = computeStats(9);
  const stats10 = computeStats(10);

  const totalOmitted = stats9.omitted + stats10.omitted;
  const totalPartial = stats9.partial + stats10.partial;

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-3xl font-bold tracking-tight">
          ICSE Syllabus 2027-28
        </h1>
        <p className="text-muted-foreground">
          Official CISCE omissions for Class 9 &amp; 10 — every topic cited to
          the source PDF.
        </p>
      </div>

      {/* Exam countdown */}
      <ExamCountdown />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold tabular-nums">
            {totalOmitted + totalPartial}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Topics with omissions
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold tabular-nums text-destructive">
            {totalOmitted}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Fully omitted
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {totalPartial}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Partially omitted
          </div>
        </div>
      </div>

      {/* Class entry cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ClassCard
          cls={9}
          subjects={stats9.subjects}
          topics={stats9.topics}
          omitted={stats9.omitted}
          partial={stats9.partial}
        />
        <ClassCard
          cls={10}
          subjects={stats10.subjects}
          topics={stats10.topics}
          omitted={stats10.omitted}
          partial={stats10.partial}
        />
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        Data sourced from official CISCE circulars · Session 2027-28 ·
        All citations traceable to source PDF pages
      </p>
    </div>
  );
}

function ClassCard({
  cls,
  subjects,
  topics,
  omitted,
  partial,
}: {
  cls: 9 | 10;
  subjects: number;
  topics: number;
  omitted: number;
  partial: number;
}) {
  return (
    <Link
      href={`/class/${cls}`}
      className="group block rounded-xl border-2 border-border hover:border-primary/50 bg-card p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ICSE
          </p>
          <h2 className="text-2xl font-black mt-0.5 group-hover:text-primary transition-colors">
            Class {cls}
          </h2>
        </div>
        <span className="text-3xl font-black text-muted-foreground/20 group-hover:text-primary/20 transition-colors select-none">
          {cls}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subjects</span>
          <span className="font-medium">{subjects}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total topics</span>
          <span className="font-medium">{topics}</span>
        </div>
        {omitted > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-destructive">Omitted</span>
            <span className="font-medium text-destructive">{omitted}</span>
          </div>
        )}
        {partial > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-amber-600 dark:text-amber-400">Partial</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {partial}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs font-medium text-primary group-hover:underline">
        Browse syllabus →
      </div>
    </Link>
  );
}
