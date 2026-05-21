import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the admin subject detail (chapters + topics) loads. */
export default function AdminSubjectDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3.5 w-28" />
      </div>

      {/* Heading */}
      <Skeleton className="h-8 w-56" />

      {/* Chapter + topic cards */}
      {Array.from({ length: 4 }).map((_, c) => (
        <div key={c} className="rounded-lg border overflow-hidden">
          {/* Chapter header */}
          <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Topic rows */}
          {Array.from({ length: c === 0 ? 5 : 3 }).map((_, t) => (
            <div key={t} className="flex items-center justify-between px-4 py-2.5 border-t gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Skeleton className="h-3 w-5 shrink-0" />
                <Skeleton className="h-3 flex-1 max-w-[260px]" />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
