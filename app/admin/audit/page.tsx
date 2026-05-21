/**
 * /admin/audit — paginated audit log.
 *
 * Shows only admin-initiated entries (change_reason IS NOT NULL).
 * Trigger-generated entries (no change_reason) are omitted from this view.
 * Page size: 50 rows. Navigate via ?page= query param.
 */
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 50;

type AuditRow = {
  id: string;
  entity_table: string;
  entity_id: string;
  action: string;
  change_reason: string | null;
  diff_jsonb: Record<string, { old: unknown; new: unknown }> | null;
  created_at: string;
  actor_user_id: string | null;
};

export const metadata = { title: "Audit Log — Admin | ICSE Syllabus" };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = createAdminClient();

  const { data, count } = await db
    .from("audit_log")
    .select(
      "id, entity_table, entity_id, action, change_reason, diff_jsonb, created_at, actor_user_id",
      { count: "exact" }
    )
    .not("change_reason", "is", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  const rows = (data ?? []) as AuditRow[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          {count ?? 0} admin-initiated{" "}
          {(count ?? 0) === 1 ? "change" : "changes"}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm border rounded-lg p-6 text-center">
          No admin changes recorded yet. Edits and soft-deletes via the admin
          panel will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <AuditEntry key={row.id} row={row} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/audit?page=${page - 1}`}
              className="text-primary hover:underline"
            >
              ← Previous
            </Link>
          )}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/audit?page=${page + 1}`}
              className="text-primary hover:underline"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Audit entry card ─────────────────────────────────────────────────────────

function AuditEntry({ row }: { row: AuditRow }) {
  const hasDiff =
    row.diff_jsonb && Object.keys(row.diff_jsonb).length > 0;

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 bg-muted/30 gap-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ActionBadge action={row.action} />
            <span className="font-mono text-xs text-muted-foreground">
              {row.entity_table}
            </span>
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">
              {row.entity_id}
            </span>
          </div>
          <p className="text-sm font-medium">{row.change_reason}</p>
        </div>
        <time
          className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
          dateTime={row.created_at}
        >
          {new Date(row.created_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </time>
      </div>

      {/* Diff */}
      {hasDiff && (
        <div className="px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Changes
          </p>
          <div className="space-y-1.5">
            {Object.entries(
              row.diff_jsonb as Record<string, { old: unknown; new: unknown }>
            ).map(([field, { old: oldVal, new: newVal }]) => (
              <div key={field} className="text-xs font-mono">
                <span className="text-muted-foreground">{field}:</span>{" "}
                <span className="text-destructive line-through">
                  {JSON.stringify(oldVal)}
                </span>{" "}
                <span className="text-muted-foreground">→</span>{" "}
                <span className="text-green-600 dark:text-green-400">
                  {JSON.stringify(newVal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    delete: "bg-destructive/15 text-destructive",
    update: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    insert: "bg-green-500/15 text-green-700 dark:text-green-400",
  };
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
        styles[action] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {action}
    </span>
  );
}
