/**
 * /admin/topics/[topicId]/delete — confirm soft-delete for a topic.
 *
 * Shows topic name + chapter context, requires a change_reason, then
 * submits to the softDeleteTopic server action.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteConfirmForm } from "@/components/admin/delete-confirm-form";
import { softDeleteTopic } from "@/lib/admin-actions";

type TopicRow = { id: string; name: string; order: number; chapter_id: string };
type ChapterRow = { id: string; name: string; order: number; subject_id: string };
type SubjectRow = { id: string; name: string; class_id: number };

export default async function DeleteTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const { topicId } = await params;
  const { subjectId } = await searchParams;

  const db = createAdminClient();

  const { data: topicData } = await db
    .from("topics")
    .select("id, name, order, chapter_id")
    .eq("id", topicId)
    .single();
  const topic = topicData as TopicRow | null;
  if (!topic || !topic) notFound();

  const { data: chapterData } = await db
    .from("chapters")
    .select("id, name, order, subject_id")
    .eq("id", topic.chapter_id)
    .single();
  const chapter = chapterData as ChapterRow | null;

  const resolvedSubjectId = subjectId ?? chapter?.subject_id ?? "";

  const { data: subjectData } = resolvedSubjectId
    ? await db
        .from("subjects")
        .select("id, name, class_id")
        .eq("id", resolvedSubjectId)
        .single()
    : { data: null };
  const subject = subjectData as SubjectRow | null;

  const backHref = resolvedSubjectId
    ? `/admin/subjects/${resolvedSubjectId}`
    : "/admin/subjects";

  return (
    <div className="space-y-6 max-w-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <Link href={backHref} className="text-muted-foreground hover:text-foreground">
          ← Back to{" "}
          {subject
            ? `${subject.name} (Class ${subject.class_id})`
            : "Subject"}
        </Link>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 space-y-3">
        <h1 className="text-lg font-bold text-destructive">Soft-Delete Topic</h1>
        <p className="text-sm">
          You are about to soft-delete:
        </p>
        <div className="rounded-md bg-background border p-3 text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Topic:</span>{" "}
            <strong>{topic.name}</strong>
          </p>
          {chapter && (
            <p>
              <span className="text-muted-foreground">Chapter:</span>{" "}
              {chapter.name} (#{chapter.order})
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          This sets <code className="font-mono text-xs">deleted_at</code> on the
          topic and its omissions. The data is retained and can be restored by an
          engineer. It will no longer appear in the public syllabus.
        </p>
      </div>

      <DeleteConfirmForm
        action={softDeleteTopic}
        hiddenFields={{ topic_id: topicId, subject_id: resolvedSubjectId }}
        cancelHref={backHref}
        submitLabel="Soft-Delete Topic"
      />
    </div>
  );
}
