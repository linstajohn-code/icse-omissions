import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the class/subject-grid page loads. */
export default function ClassLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>

      {/* Countdown banner */}
      <Skeleton className="h-14 w-full mb-8 rounded-lg" />

      {/* Subject grid — three groups */}
      {[7, 4, 3].map((count, g) => (
        <div key={g} className="mb-8">
          <Skeleton className="h-3 w-32 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
