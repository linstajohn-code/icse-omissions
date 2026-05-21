import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the admin audit log loads. */
export default function AuditLogLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Audit log table */}
      <div className="rounded-lg border overflow-hidden">
        {/* Table header */}
        <div className="bg-muted/50 grid grid-cols-5 px-4 py-2.5 gap-4">
          {["Table", "Action", "Reason", "Actor", "When"].map((h) => (
            <Skeleton key={h} className="h-3 w-12" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-t space-y-2">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-full max-w-[180px]" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            {/* Occasional diff preview */}
            {i % 3 === 0 && (
              <div className="ml-4 rounded bg-muted/50 px-3 py-2 space-y-1">
                <Skeleton className="h-2.5 w-2/3" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}
