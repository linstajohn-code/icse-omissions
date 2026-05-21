import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton shown while the admin subjects list loads. */
export default function AdminSubjectsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-28" />

      {["Class 9", "Class 10"].map((label) => (
        <div key={label}>
          <Skeleton className="h-6 w-20 mb-3" />
          <div className="rounded-lg border overflow-hidden">
            {/* Header */}
            <div className="bg-muted/50 grid grid-cols-4 px-4 py-2.5 gap-4">
              {[16, 40, 20, 16].map((w, i) => (
                <Skeleton key={i} className={`h-3 w-${w}`} />
              ))}
            </div>
            {/* Rows */}
            {Array.from({ length: label === "Class 9" ? 9 : 9 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 px-4 py-2.5 gap-4 border-t">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-14 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
