import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the admin dashboard loads. */
export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-36" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 text-center space-y-2">
            <Skeleton className="h-9 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Recent changes table */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="rounded-lg border overflow-hidden">
          {/* Header row */}
          <div className="bg-muted/50 grid grid-cols-4 px-4 py-2 gap-4">
            {["Table", "Action", "Reason", "When"].map((h) => (
              <Skeleton key={h} className="h-3 w-12" />
            ))}
          </div>
          {/* Data rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 px-4 py-3 gap-4 border-t">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-full max-w-[200px]" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
