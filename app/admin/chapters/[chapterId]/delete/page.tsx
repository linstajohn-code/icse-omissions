/**
 * /admin/chapters/[chapterId]/delete — confirm soft-delete for a chapter.
 *
 * Soft-deleting a chapter cascades through the app's soft-delete logic
 * (topics in that chapter will also be hidden from public view because
 *  the public read policies filter on deleted_at IS NULL at the chapter level,
 *  and the chapter join is skipped for deleted chapters).
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteConfirmForm } from "@/components/admin/delete-confirm-form";
import { softDeleteChapter } from "@/lib/admin-actions";

type ChapterRow = {
  id: string;
  name: string;
  order: number;
  subject_id: string;
};
type SubjectRow = { id: string; name: string; class_id: number };

export default async function DeleteChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const { chapterId } = await params;
  const { subjectId } = await searchParams;

  const db = createAdminClient();

  const { data: chapterData } = await db
    .from("chapters")
    .select("id, name, order, subject_id")
    .eq("id", chapterId)
    .single();
  const chapter = chapterData as ChapterRow | null;
  if (!chapter) notFound();

  const resolvedSubjectId = subjectId ?? chapter.subject_id;

  const { data: subjectData } = await db
    .from("subjects")
    .select("id, name, class_id")
    .eq("id", resolvedSubjectId)
    .single();
  const subject = subjectData as SubjectRow | null;

  // Count topics in this chapter
  const { count: topicCount } = await db
    .from("topics")
    .select("*", { count: "exact", head: true })
    .eq("chapter_id", chapterId)
    .is("deleted_at", null);

  const backHref = `/admin/subjects/${resolvedSubjectId}`;

  return (
    <div className="space-y-6 max-w-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={backHref} className="text-muted-foreground hover:text-foreground">
          ←{" "}
          {subject
            ? `${subject.name} (Class ${subject.class_id})`
            : "Subject"}
        </Link>
      </div>

      {/* Warning */}
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 space-y-3">
        <h1 className="text-lg font-bold text-destructive">
          Soft-Delete Chapter
        </h1>
        <p className="text-sm">You are about to soft-delete:</p>
        <div className="rounded-md bg-background border p-3 text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Chapter:</span>{" "}
            <strong>{chapter.name}</strong> (#{chapter.order})
          </p>
          {subject && (
            <p>
              <span className="text-muted-foreground">Subject:</span>{" "}
              {subject.name} — Class {subject.class_id}
            </p>
          )}
          {(topicCount ?? 0) > 0 && (
            <p className="text-amber-700 dark:text-amber-400">
              ⚠ This chapter has {topicCount} active topic
              {topicCount !== 1 ? "s" : ""} which will also be hidden.
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Sets <code className="font-mono text-xs">deleted_at</code> on the
          chapter row. All topics in this chapter will be excluded from public
          syllabus views. The data is retained in the database.
        </p>
      </div>

      <DeleteConfirmForm
        action={softDeleteChapter}
        hiddenFields={{ chapter_id: chapterId, subject_id: resolvedSubjectId }}
        cancelHref={backHref}
        submitLabel="Soft-Delete Chapter"
      />
    </div>
  );
}
