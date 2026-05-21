/**
 * Bookmarks API — uses "topic keys" (not UUIDs).
 *
 * Topic key format: "{class}/{subjectSlug}/{chapterOrder}/{topicOrder}"
 *
 * GET  /api/bookmarks?keys=9/mathematics/1/3,9/mathematics/1/4
 *   Returns { bookmarked: string[] }
 *
 * POST /api/bookmarks   body: { key: string, bookmarked: boolean }
 *   Toggle a bookmark. Requires auth.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function resolveTopicId(
  supabase: SupabaseClient,
  key: string
): Promise<string | null> {
  const parts = key.split("/");
  if (parts.length !== 4) return null;
  const [clsStr, subjectSlug, chOrderStr, tOrderStr] = parts as [string, string, string, string];
  const cls = parseInt(clsStr, 10);
  const chOrder = parseInt(chOrderStr, 10);
  const tOrder = parseInt(tOrderStr, 10);
  if (isNaN(cls) || isNaN(chOrder) || isNaN(tOrder)) return null;

  const { data: s } = await supabase
    .from("subjects")
    .select("id")
    .eq("class_id", cls)
    .eq("slug", subjectSlug)
    .single();
  const subjectId = (s as { id: string } | null)?.id;
  if (!subjectId) return null;

  const { data: c } = await supabase
    .from("chapters")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("order", chOrder)
    .single();
  const chapterId = (c as { id: string } | null)?.id;
  if (!chapterId) return null;

  const { data: t } = await supabase
    .from("topics")
    .select("id")
    .eq("chapter_id", chapterId)
    .eq("order", tOrder)
    .single();
  return (t as { id: string } | null)?.id ?? null;
}

export async function GET(request: NextRequest) {
  const keys =
    request.nextUrl.searchParams.get("keys")?.split(",").filter(Boolean) ?? [];
  if (keys.length === 0) return NextResponse.json({ bookmarked: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ bookmarked: [] });

  const pairs = await Promise.all(
    keys.map(async (key) => ({ key, id: await resolveTopicId(supabase, key) }))
  );
  const validIds = pairs.filter((p) => p.id !== null).map((p) => p.id as string);
  if (validIds.length === 0) return NextResponse.json({ bookmarked: [] });

  const { data } = await supabase
    .from("bookmarks")
    .select("topic_id")
    .eq("user_id", user.id)
    .in("topic_id", validIds);

  const bookmarkedIds = new Set(
    (data as { topic_id: string }[] | null ?? []).map((b) => b.topic_id)
  );
  const bookmarkedKeys = pairs
    .filter((p) => p.id !== null && bookmarkedIds.has(p.id as string))
    .map((p) => p.key);

  return NextResponse.json({ bookmarked: bookmarkedKeys });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { key: string; bookmarked: boolean };
  const topicId = await resolveTopicId(supabase, body.key);
  if (!topicId) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  if (body.bookmarked) {
    const { error } = await supabase
      .from("bookmarks")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase-js requires typed insert
      .upsert({ user_id: user.id, topic_id: topicId } as any, {
        onConflict: "user_id,topic_id",
        ignoreDuplicates: true,
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("topic_id", topicId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
