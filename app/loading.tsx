import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the homepage loads. */
export default function HomeLoading() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3 pt-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>

      {/* Exam countdown banner */}
      <Skeleton className="h-16 w-full rounded-lg" />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 text-center space-y-2">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        ))}
      </div>

      {/* Class entry cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[9, 10].map((cls) => (
          <div key={cls} className="rounded-xl border-2 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
