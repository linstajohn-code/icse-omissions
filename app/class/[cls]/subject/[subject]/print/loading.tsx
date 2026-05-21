import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the print checklist page loads. */
export default function PrintLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      {/* Chapter sections */}
      {Array.from({ length: 3 }).map((_, c) => (
        <div key={c} className="space-y-2">
          <Skeleton className="h-5 w-48" />
          {/* Topic rows */}
          {Array.from({ length: 5 }).map((_, t) => (
            <div key={t} className="flex items-center gap-3 py-1.5 border-b">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-3 w-6 shrink-0" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-12 shrink-0" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
