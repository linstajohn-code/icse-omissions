/**
 * Exam countdown — server component, no client JS needed.
 *
 * ICSE Class 10 board exams 2028 typically start late February.
 * Using Feb 27, 2028 as the approximate first paper date.
 * Update EXAM_DATE when CISCE publishes the official timetable.
 */

/** Approximate first paper date for ICSE 2028 board exams (Class 10). */
const EXAM_DATE = new Date("2028-02-27T00:00:00+05:30"); // IST

function daysUntil(target: Date): number {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / msPerDay));
}

function urgencyClass(days: number): string {
  if (days <= 30)
    return "bg-destructive/10 border-destructive/30 text-destructive";
  if (days <= 90)
    return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400";
  return "bg-primary/5 border-primary/20 text-primary";
}

export function ExamCountdown() {
  const days = daysUntil(EXAM_DATE);

  if (days === 0) {
    return (
      <div className="rounded-lg border bg-destructive/10 border-destructive/30 px-4 py-3 text-sm text-destructive font-medium">
        🎓 ICSE 2028 exams are starting today — good luck!
      </div>
    );
  }

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  const label =
    months > 0
      ? `${months} month${months !== 1 ? "s" : ""}${
          remainingDays > 0 ? ` ${remainingDays} day${remainingDays !== 1 ? "s" : ""}` : ""
        }`
      : `${days} day${days !== 1 ? "s" : ""}`;

  return (
    <div
      className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-4 ${urgencyClass(days)}`}
      role="status"
      aria-label={`${days} days until ICSE 2028 board exams`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
          ICSE 2028 Board Exams
        </p>
        <p className="text-base font-bold mt-0.5">
          {label} to go
        </p>
      </div>
      <div className="text-right">
        <p className="text-3xl font-black tabular-nums leading-none">{days}</p>
        <p className="text-xs mt-0.5 opacity-70">days</p>
      </div>
    </div>
  );
}
