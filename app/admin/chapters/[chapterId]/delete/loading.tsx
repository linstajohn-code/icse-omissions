import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the chapter soft-delete confirmation page loads. */
export default function DeleteChapterLoading() {
  return (
    <div className="space-y-6 max-w-lg">
      {/* Back link */}
      <Skeleton className="h-4 w-36" />

      {/* Warning block */}
      <div className="rounded-lg border p-5 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-48" />
        <div className="rounded-md border p-3 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        {/* Active topics warning */}
        <div className="rounded-md border border-amber-300/50 bg-amber-50/30 p-3 space-y-1.5">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
