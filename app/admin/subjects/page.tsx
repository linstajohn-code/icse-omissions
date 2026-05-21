/**
 * /admin/subjects — lists all subjects grouped by class with links to manage each.
 */
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type SubjectRow = {
  id: string;
  class_id: number;
  name: string;
  code: string;
  slug: string;
  subject_group: string;
};

export const metadata = { title: "Subjects — Admin | ICSE Syllabus" };

export default async function AdminSubjectsPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("subjects")
    .select("id, class_id, name, code, slug, subject_group")
    .order("class_id")
    .order("subject_group")
    .order("name");

  const subjects = (data ?? []) as SubjectRow[];
  const cls9 = subjects.filter((s) => s.class_id === 9);
  const cls10 = subjects.filter((s) => s.class_id === 10);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Subjects</h1>

      {(
        [
          { label: "Class 9", rows: cls9 },
          { label: "Class 10", rows: cls10 },
        ] as const
      ).map(({ label, rows }) => (
        <div key={label}>
          <h2 className="text-lg font-semibold mb-3">{label}</h2>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium w-16">
                    Code
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium">
                    Subject
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium w-20">
                    Group
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {s.code}
                    </td>
                    <td className="px-4 py-2.5">{s.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      Group {s.subject_group}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/admin/subjects/${s.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
