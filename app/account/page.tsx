/**
 * /account — user dashboard.
 *
 * Shows:
 *   • Profile header (avatar + email)
 *   • Study stats: bookmarks, revised count, notes
 *   • Progress breakdown bar
 *   • Bookmarked topics list (most recent 20, with links)
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Bookmark, CheckSquare, PenLine, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import { chapterToSlug } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account | ICSE Syllabus" };

// ─── types ────────────────────────────────────────────────────────────────────

type BookmarkRow = {
  topic_id: string;
  created_at: string;
  topics: {
    name: string;
    order: number;
    chapters: {
      name: string;
      order: number;
      subjects: {
        name: string;
        slug: string;
        class_id: number;
      };
    };
  };
};

type ProgressRow = { status: string };

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/account");

  // Fetch stats + bookmark list in parallel
  const [progressRes, notesCountRes, bookmarksRes] = await Promise.all([
    supabase
      .from("user_progress")
      .select("status")
      .eq("user_id", user.id),
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("bookmarks")
      .select(
        `topic_id, created_at,
         topics (
           name, "order",
           chapters (
             name, "order",
             subjects ( name, slug, class_id )
           )
         )`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Progress breakdown
  const progressRows = ((progressRes.data ?? []) as ProgressRow[]);
  const progressCounts = {
    not_started: 0,
    in_progress: progressRows.filter((r) => r.status === "in_progress").length,
    revised: progressRows.filter((r) => r.status === "revised").length,
  };
  const totalTracked = progressRows.length;
  const bookmarkCount =
    // reason: nested select returns unknown shape; typed manually
    ((bookmarksRes.data ?? []) as unknown as BookmarkRow[]).length;
  const notesCount = notesCountRes.count ?? 0;

  // Bookmarks
  const bookmarks = (bookmarksRes.data ?? []) as unknown as BookmarkRow[];

  const initials = (user.email ?? "?")
    .split("@")[0]!
    .slice(0, 2)
    .toUpperCase();

  const profileRole = (
    (user.app_metadata as Record<string, unknown>)["role"] as string | undefined
  ) ?? "student";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{user.email}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {profileRole}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Bookmark className="h-5 w-5 text-primary" aria-hidden />}
          value={bookmarkCount}
          label="Bookmarks"
        />
        <StatCard
          icon={<CheckSquare className="h-5 w-5 text-primary" aria-hidden />}
          value={progressCounts.revised}
          label="Revised"
        />
        <StatCard
          icon={<PenLine className="h-5 w-5 text-primary" aria-hidden />}
          value={notesCount}
          label="Notes"
        />
      </div>

      {/* Progress breakdown */}
      {totalTracked > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Revision Progress</h2>
          <div className="space-y-2">
            <ProgressBar
              label="Revised"
              count={progressCounts.revised}
              total={totalTracked}
              colorClass="bg-green-500"
            />
            <ProgressBar
              label="In progress"
              count={progressCounts.in_progress}
              total={totalTracked}
              colorClass="bg-amber-500"
            />
            <ProgressBar
              label="Not started"
              count={
                totalTracked -
                progressCounts.revised -
                progressCounts.in_progress
              }
              total={totalTracked}
              colorClass="bg-muted-foreground/30"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {progressCounts.revised} of {totalTracked} tracked topics marked
            revised
          </p>
        </div>
      )}

      {/* Bookmarks list */}
      {bookmarks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Bookmarked Topics</h2>
          <div className="rounded-lg border divide-y">
            {bookmarks.map((bm) => {
              const topic = bm.topics;
              const chapter = topic?.chapters;
              const subject = chapter?.subjects;
              if (!topic || !chapter || !subject) return null;

              const href = `/class/${subject.class_id}/subject/${subject.slug}/${chapterToSlug(chapter.name)}`;

              return (
                <Link
                  key={bm.topic_id}
                  href={href}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <Bookmark
                    className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary fill-primary"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {topic.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Class {subject.class_id} · {subject.name} ·{" "}
                      {chapter.name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          {bookmarkCount > 20 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing 20 of {bookmarkCount} bookmarks
            </p>
          )}
        </div>
      )}

      {bookmarks.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No bookmarks yet.{" "}
          <Link href="/" className="text-primary hover:underline">
            Browse the syllabus
          </Link>{" "}
          and bookmark topics you want to revisit.
        </div>
      )}

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <User className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${pct}%`}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
        {count}
      </span>
    </div>
  );
}
