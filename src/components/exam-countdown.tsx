/**
 * ExamCountdown — server component, no client JS needed.
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
    return "bg-destructive/8 border-destructive/20 text-destructive";
  if (days <= 90)
    return "bg-amber-500/8 border-amber-500/20 text-amber-700 dark:text-amber-400";
  return "bg-primary/5 border-primary/15 text-primary/80";
}

export function ExamCountdown() {
  const days = daysUntil(EXAM_DATE);

  if (days === 0) {
    return (
      <div
        className="rounded-lg border bg-destructive/8 border-destructive/20 px-6 py-5 text-destructive"
        role="status"
        aria-label="ICSE 2028 board exams are starting today"
      >
        <p className="font-display text-xl font-light italic">
          🎓 ICSE 2028 exams are starting today — good luck.
        </p>
      </div>
    );
  }

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  const label =
    months > 0
      ? `${months} month${months !== 1 ? "s" : ""}${
          remainingDays > 0
            ? ` ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`
            : ""
        }`
      : `${days} day${days !== 1 ? "s" : ""}`;

  return (
    <div
      className={`rounded-lg border px-6 py-5 ${urgencyClass(days)}`}
      role="status"
      aria-label={`${days} days until ICSE 2028 board exams`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase font-light opacity-60">
            ICSE 2028 · Board Exams Begin
          </p>
          <p className="font-display text-xl font-light mt-1.5 italic">
            {label} remaining
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-5xl font-light tabular-nums leading-none">
            {days}
          </p>
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 mt-1 font-light">
            days
          </p>
        </div>
      </div>
    </div>
  );
}
