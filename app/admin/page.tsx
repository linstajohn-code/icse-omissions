/**
 * Admin dashboard — site-wide stats + last 10 admin-initiated changes.
 */
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type AuditRow = {
  id: string;
  entity_table: string;
  entity_id: string;
  action: string;
  change_reason: string | null;
  created_at: string;
  actor_user_id: string | null;
};

export default async function AdminDashboardPage() {
  const db = createAdminClient();

  const [
    { count: subjectCount },
    { count: chapterCount },
    { count: topicCount },
    { count: omissionCount },
    { data: recentAudit },
  ] = await Promise.all([
    db.from("subjects").select("*", { count: "exact", head: true }),
    db
      .from("chapters")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    db
      .from("topics")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    db
      .from("omissions")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    db
      .from("audit_log")
      .select(
        "id, entity_table, entity_id, action, change_reason, created_at, actor_user_id"
      )
      .not("change_reason", "is", null)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const audit = (recentAudit ?? []) as AuditRow[];

  const stats = [
    { label: "Subjects", value: subjectCount ?? 0 },
    { label: "Chapters", value: chapterCount ?? 0 },
    { label: "Topics", value: topicCount ?? 0 },
    { label: "Omissions", value: omissionCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold tabular-nums">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/subjects"
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Manage Subjects →
        </Link>
        <Link
          href="/admin/audit"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Full Audit Log →
        </Link>
      </div>

      {/* Recent changes */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Changes</h2>
        {audit.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No admin changes recorded yet.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Table</th>
                  <th className="text-left px-4 py-2 font-medium">Action</th>
                  <th className="text-left px-4 py-2 font-medium">Reason</th>
                  <th className="text-left px-4 py-2 font-medium">When (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {audit.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {row.entity_table}
                    </td>
                    <td className="px-4 py-2">
                      <ActionBadge action={row.action} />
                    </td>
                    <td className="px-4 py-2 text-muted-foreground max-w-xs truncate">
                      {row.change_reason}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    delete: "text-destructive",
    update: "text-amber-600 dark:text-amber-400",
    insert: "text-green-600 dark:text-green-400",
  };
  return (
    <span className={styles[action] ?? "text-muted-foreground"}>{action}</span>
  );
}
