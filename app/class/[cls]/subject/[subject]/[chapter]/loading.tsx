import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the topic-list page loads. */
export default function ChapterLoading() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Heading */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Source PDF banner */}
      <Skeleton className="h-11 w-full mb-6 rounded-lg" />

      {/* Topic cards */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-6 w-6 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
