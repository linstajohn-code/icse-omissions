/**
 * Notes API — per-topic personal study notes (Markdown).
 *
 * GET  /api/notes?keys=9/mathematics/1/3,9/mathematics/1/4
 *   Returns { notes: Record<topicKey, string> }
 *   Missing keys → not present in the Record (treat as "")
 *
 * PUT  /api/notes   body: { key: string, notes_md: string }
 *   Upsert note. Empty string deletes the row. Requires auth.
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
  const [clsStr, subjectSlug, chOrderStr, tOrderStr] = parts as [
    string,
    string,
    string,
    string,
  ];
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
  if (keys.length === 0) return NextResponse.json({ notes: {} });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notes: {} });

  const pairs = await Promise.all(
    keys.map(async (key) => ({ key, id: await resolveTopicId(supabase, key) }))
  );
  const validPairs = pairs.filter((p) => p.id !== null) as {
    key: string;
    id: string;
  }[];
  if (validPairs.length === 0) return NextResponse.json({ notes: {} });

  const { data } = await supabase
    .from("notes")
    .select("topic_id, body_md")
    .eq("user_id", user.id)
    .in(
      "topic_id",
      validPairs.map((p) => p.id)
    );

  const rows =
    (data as { topic_id: string; body_md: string }[] | null) ?? [];
  const idToNote = new Map(rows.map((r) => [r.topic_id, r.body_md]));
  const notes: Record<string, string> = {};
  for (const { key, id } of validPairs) {
    const body = idToNote.get(id);
    if (body !== undefined) notes[key] = body;
  }

  return NextResponse.json({ notes });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { key: string; notes_md: string };
  if (typeof body.notes_md !== "string") {
    return NextResponse.json({ error: "notes_md must be a string" }, { status: 400 });
  }

  const topicId = await resolveTopicId(supabase, body.key);
  if (!topicId)
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  // Empty string → delete the note row (keeps the DB clean)
  if (body.notes_md.trim() === "") {
    await supabase
      .from("notes")
      .delete()
      .eq("user_id", user.id)
      .eq("topic_id", topicId);
    return NextResponse.json({ ok: true });
  }

  // reason: no Database generic on supabase client; explicit cast required
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertRow = { user_id: user.id, topic_id: topicId, body_md: body.notes_md } as any;
  const { error } = await supabase
    .from("notes")
    .upsert(upsertRow, { onConflict: "user_id,topic_id" });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
