import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listSubjectSummaries } from "@/lib/data";
import { SubjectCard } from "@/components/subject-card";
import { ClassToggle } from "@/components/class-toggle";
import { ExamCountdown } from "@/components/exam-countdown";

interface Props {
  params: Promise<{ cls: string }>;
}

function parseClass(cls: string): 9 | 10 {
  if (cls === "9") return 9;
  if (cls === "10") return 10;
  return notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cls } = await params;
  const icseClass = parseClass(cls);
  return {
    title: `Class ${icseClass} Subjects`,
    description: `All ICSE Class ${icseClass} subjects for the 2027-28 session.`,
  };
}

export default async function ClassPage({ params }: Props) {
  const { cls } = await params;
  const icseClass = parseClass(cls);
  const subjects = listSubjectSummaries(icseClass);

  const totalOmitted = subjects.reduce((n, s) => n + s.omittedCount, 0);
  const totalPartial = subjects.reduce((n, s) => n + s.partialCount, 0);

  const groups = [
    { label: "Group I — Core", subjects: subjects.filter((s) => s.group === "I") },
    { label: "Group II — Electives", subjects: subjects.filter((s) => s.group === "II") },
    { label: "Group III — Electives", subjects: subjects.filter((s) => s.group === "III") },
  ].filter((g) => g.subjects.length > 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Class {icseClass} — ICSE 2027-28
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {subjects.length} subjects ·{" "}
            <span className="text-destructive font-medium">
              {totalOmitted} omitted
            </span>
            {totalPartial > 0 && (
              <>
                {" · "}
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {totalPartial} partial
                </span>
              </>
            )}
          </p>
        </div>
        <ClassToggle activeClass={icseClass} />
      </div>

      <div className="mb-8">
        <ExamCountdown />
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.subjects.map((subject) => (
                <SubjectCard key={subject.slug} subject={subject} icseClass={icseClass} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [{ cls: "9" }, { cls: "10" }];
}
