/**
 * /admin/topics/[topicId]/edit — server component that loads data and
 * passes it to the EditOmissionForm client component.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditOmissionForm } from "./edit-form";

type OmissionRow = {
  id: string;
  status: string;
  notes_md: string | null;
  source_page: number;
  source_excerpt: string;
  effective_session: string;
  cisce_circular_id: string | null;
};

type TopicRow = {
  id: string;
  name: string;
  order: number;
  chapter_id: string;
};

type ChapterRow = {
  id: string;
  name: string;
  order: number;
  subject_id: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const db = createAdminClient();
  const { data } = await db
    .from("topics")
    .select("name")
    .eq("id", topicId)
    .single();
  const t = data as { name: string } | null;
  return { title: t ? `Edit: ${t.name} — Admin` : "Edit Topic — Admin" };
}

export default async function EditTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const { topicId } = await params;
  const { subjectId } = await searchParams;

  const db = createAdminClient();

  // Load topic
  const { data: topicData } = await db
    .from("topics")
    .select("id, name, order, chapter_id")
    .eq("id", topicId)
    .single();
  const topic = topicData as TopicRow | null;
  if (!topic) notFound();

  // Load chapter (for breadcrumb + subject context)
  const { data: chapterData } = await db
    .from("chapters")
    .select("id, name, order, subject_id")
    .eq("id", topic.chapter_id)
    .single();
  const chapter = chapterData as ChapterRow | null;

  // Use subjectId from URL param or fall back to chapter's subject_id
  const resolvedSubjectId = subjectId ?? chapter?.subject_id ?? "";

  // Load the active omission for 2027-28
  const { data: omissionsData } = await db
    .from("omissions")
    .select(
      "id, status, notes_md, source_page, source_excerpt, effective_session, cisce_circular_id"
    )
    .eq("topic_id", topicId)
    .eq("effective_session", "2027-28")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const omission = ((omissionsData ?? []) as OmissionRow[])[0] ?? null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <Link
          href="/admin/subjects"
          className="text-muted-foreground hover:text-foreground"
        >
          Subjects
        </Link>
        {chapter && resolvedSubjectId && (
          <>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/admin/subjects/${resolvedSubjectId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {chapter.name}
            </Link>
          </>
        )}
        <span className="text-muted-foreground">/</span>
        <span className="font-semibold">{topic.name}</span>
      </div>

      <div>
        <h1 className="text-xl font-bold">Edit Topic Omission</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Session: 2027-28 · Topic #{chapter?.order}.{topic.order}
        </p>
      </div>

      {/* Source citation (read-only) */}
      {omission && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Source Citation (read-only)
          </p>
          <p className="text-sm">
            <span className="font-medium">Page:</span> {omission.source_page}
          </p>
          <blockquote className="text-sm italic text-muted-foreground border-l-2 pl-3">
            {omission.source_excerpt}
          </blockquote>
        </div>
      )}

      {omission ? (
        <EditOmissionForm
          omissionId={omission.id}
          topicId={topicId}
          subjectId={resolvedSubjectId}
          currentStatus={omission.status}
          currentNotesMd={omission.notes_md ?? ""}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No active omission found for this topic in session 2027-28.
          <br />
          Re-run{" "}
          <code className="font-mono text-xs">pnpm db:seed</code> to populate.
        </div>
      )}
    </div>
  );
}
