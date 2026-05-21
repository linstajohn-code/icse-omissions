/**
 * /admin/subjects/[subjectId] — all chapters + topics for one subject.
 *
 * Shows soft-deleted rows as greyed-out/struck-through.
 * Edit and Delete links for active topics; Delete link for active chapters.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── types ────────────────────────────────────────────────────────────────────

type OmissionRow = {
  id: string;
  status: string;
  effective_session: string;
  deleted_at: string | null;
};

type TopicRow = {
  id: string;
  name: string;
  order: number;
  deleted_at: string | null;
  omissions: OmissionRow[];
};

type ChapterRow = {
  id: string;
  name: string;
  order: number;
  deleted_at: string | null;
  topics: TopicRow[];
};

type SubjectRow = { id: string; name: string; class_id: number };

// ─── page ─────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const db = createAdminClient();
  const { data } = await db
    .from("subjects")
    .select("name, class_id")
    .eq("id", subjectId)
    .single();
  const s = data as { name: string; class_id: number } | null;
  return {
    title: s ? `${s.name} (Class ${s.class_id}) — Admin` : "Subject — Admin",
  };
}

export default async function AdminSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const db = createAdminClient();

  const { data: subjectData } = await db
    .from("subjects")
    .select("id, name, class_id")
    .eq("id", subjectId)
    .single();
  const subject = subjectData as SubjectRow | null;
  if (!subject) notFound();

  // Fetch all chapters (including deleted) with their topics + omissions
  const { data: chaptersData } = await db
    .from("chapters")
    .select(
      `id, name, "order", deleted_at,
       topics ( id, name, "order", deleted_at,
         omissions ( id, status, effective_session, deleted_at )
       )`
    )
    .eq("subject_id", subjectId)
    .order("order");

  // reason: no Database generic on supabase client; nested shape typed manually
  const chapters = ((chaptersData ?? []) as unknown as ChapterRow[]).map(
    (ch) => ({
      ...ch,
      topics: (ch.topics ?? []).sort((a, b) => a.order - b.order),
    })
  );

  const activeCount = chapters.filter((c) => !c.deleted_at).length;
  const deletedCount = chapters.filter((c) => c.deleted_at).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/subjects"
          className="text-muted-foreground hover:text-foreground"
        >
          Subjects
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-bold">
          Class {subject.class_id} — {subject.name}
        </h1>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        {activeCount} active chapter{activeCount !== 1 ? "s" : ""}
        {deletedCount > 0 ? ` · ${deletedCount} soft-deleted` : ""}
      </p>

      {/* Chapters */}
      {chapters.length === 0 ? (
        <p className="text-muted-foreground text-sm border rounded-lg p-6 text-center">
          No chapters found. Run{" "}
          <code className="font-mono text-xs">pnpm db:seed</code> to populate.
        </p>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              subjectId={subjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function ChapterCard({
  chapter: ch,
  subjectId,
}: {
  chapter: ChapterRow;
  subjectId: string;
}) {
  const activeTopics = ch.topics.filter((t) => !t.deleted_at);
  const deletedTopics = ch.topics.filter((t) => t.deleted_at);

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        ch.deleted_at ? "opacity-50" : ""
      }`}
    >
      {/* Chapter header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            #{ch.order}
          </span>
          <span
            className={`font-semibold text-sm ${ch.deleted_at ? "line-through" : ""}`}
          >
            {ch.name}
          </span>
          {ch.deleted_at && <DeletedTag />}
        </div>
        {!ch.deleted_at && (
          <Link
            href={`/admin/chapters/${ch.id}/delete?subjectId=${subjectId}`}
            className="text-xs text-destructive hover:underline shrink-0 ml-3"
          >
            Delete chapter
          </Link>
        )}
      </div>

      {/* Topic list */}
      {ch.topics.length === 0 ? (
        <div className="px-4 py-3 text-xs text-muted-foreground italic">
          No topics
        </div>
      ) : (
        <div className="divide-y">
          {ch.topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              chapterOrder={ch.order}
              subjectId={subjectId}
            />
          ))}
        </div>
      )}

      {deletedTopics.length > 0 && activeTopics.length > 0 && (
        <div className="px-4 py-1.5 bg-muted/20 text-xs text-muted-foreground">
          {deletedTopics.length} topic{deletedTopics.length !== 1 ? "s" : ""}{" "}
          soft-deleted
        </div>
      )}
    </div>
  );
}

function TopicRow({
  topic,
  chapterOrder,
  subjectId,
}: {
  topic: TopicRow;
  chapterOrder: number;
  subjectId: string;
}) {
  const activeOmission = topic.omissions?.find(
    (o) => !o.deleted_at && o.effective_session === "2027-28"
  );

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 gap-3 ${
        topic.deleted_at ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {chapterOrder}.{topic.order}
        </span>
        <span
          className={`text-sm truncate ${topic.deleted_at ? "line-through" : ""}`}
        >
          {topic.name}
        </span>
        {activeOmission && <StatusBadge status={activeOmission.status} />}
        {topic.deleted_at && <DeletedTag />}
      </div>

      {!topic.deleted_at && (
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/admin/topics/${topic.id}/edit?subjectId=${subjectId}`}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </Link>
          <Link
            href={`/admin/topics/${topic.id}/delete?subjectId=${subjectId}`}
            className="text-xs text-destructive hover:underline"
          >
            Delete
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    omitted: "bg-destructive/15 text-destructive",
    partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    included: "bg-green-500/15 text-green-700 dark:text-green-400",
  };
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function DeletedTag() {
  return (
    <span className="text-xs bg-destructive/15 text-destructive px-1.5 py-0.5 rounded shrink-0">
      deleted
    </span>
  );
}
