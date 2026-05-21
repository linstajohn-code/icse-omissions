import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the topic edit form loads. */
export default function EditTopicLoading() {
  return (
    <div className="space-y-6 max-w-lg">
      {/* Back link */}
      <Skeleton className="h-4 w-40" />

      {/* Source citation block */}
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Edit form */}
      <div className="space-y-5">
        {/* Status radio group */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        {/* Notes textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
        {/* Change reason */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
