/**
 * Progress API — uses "topic keys" matching the bookmarks API format.
 *
 * GET  /api/progress?keys=9/mathematics/1/3,9/mathematics/1/4
 *   Returns { progress: Record<topicKey, ProgressStatus> }
 *
 * PUT  /api/progress   body: { key: string, status: ProgressStatus }
 *   Upsert progress. Requires auth.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProgressStatus } from "@/types/database";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const VALID_STATUSES: ProgressStatus[] = ["not_started", "in_progress", "revised"];

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
  if (keys.length === 0) return NextResponse.json({ progress: {} });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ progress: {} });

  const pairs = await Promise.all(
    keys.map(async (key) => ({ key, id: await resolveTopicId(supabase, key) }))
  );
  const validPairs = pairs.filter((p) => p.id !== null) as { key: string; id: string }[];
  if (validPairs.length === 0) return NextResponse.json({ progress: {} });

  const { data } = await supabase
    .from("user_progress")
    .select("topic_id, status")
    .eq("user_id", user.id)
    .in("topic_id", validPairs.map((p) => p.id));

  const rows = data as { topic_id: string; status: string }[] | null ?? [];
  const idToStatus = new Map(rows.map((r) => [r.topic_id, r.status as ProgressStatus]));
  const progress: Record<string, ProgressStatus> = {};
  for (const { key, id } of validPairs) {
    progress[key] = idToStatus.get(id) ?? "not_started";
  }

  return NextResponse.json({ progress });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { key: string; status: ProgressStatus };

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const topicId = await resolveTopicId(supabase, body.key);
  if (!topicId) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  const { error } = await supabase
    .from("user_progress")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({ user_id: user.id, topic_id: topicId, status: body.status } as any, {
      onConflict: "user_id,topic_id",
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
