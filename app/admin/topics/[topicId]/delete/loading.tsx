import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the topic soft-delete confirmation page loads. */
export default function DeleteTopicLoading() {
  return (
    <div className="space-y-6 max-w-lg">
      {/* Back link */}
      <Skeleton className="h-4 w-36" />

      {/* Warning block */}
      <div className="rounded-lg border p-5 space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3 w-48" />
        <div className="rounded-md border p-3 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
