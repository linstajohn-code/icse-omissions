import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listSubjectSummaries } from "@/lib/data";
import { AnimatedSubjectGrid } from "@/components/animated-subject-grid";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-light tracking-tight">
            Class{" "}
            <span className="italic text-champagne">{icseClass}</span>
            <span className="ml-3 text-2xl font-light text-muted-foreground/40 not-italic tracking-[0.1em]">
              ICSE 2027–28
            </span>
          </h1>
          <p className="text-muted-foreground/60 text-xs font-light tracking-wide mt-2">
            {subjects.length} subjects
            {totalOmitted > 0 && (
              <>
                {" · "}
                <span className="text-destructive/70">{totalOmitted} omitted</span>
              </>
            )}
            {totalPartial > 0 && (
              <>
                {" · "}
                <span className="text-amber-600/70 dark:text-amber-400/60">{totalPartial} partial</span>
              </>
            )}
          </p>
        </div>
        <ClassToggle activeClass={icseClass} />
      </div>

      <div className="mb-10">
        <ExamCountdown />
      </div>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="text-[10px] font-light uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">
              {group.label}
            </h2>
            <AnimatedSubjectGrid subjects={group.subjects} icseClass={icseClass} />
          </section>
        ))}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return [{ cls: "9" }, { cls: "10" }];
}
