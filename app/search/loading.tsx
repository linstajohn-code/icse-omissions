import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the search page loads. */
export default function SearchLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-20 mb-6" />

      {/* Search form */}
      <div className="mb-6">
        <div className="flex gap-2 flex-col sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      {/* Result count */}
      <Skeleton className="h-4 w-48 mb-4" />

      {/* Result cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
            {/* Topic name + badge */}
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
            {/* Excerpt */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
