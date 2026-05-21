"use server";

/**
 * Admin server actions — require admin role, write through service-role client.
 *
 * Every mutation:
 *   1. Verifies the calling user is an admin (via session + users.role).
 *   2. Performs the write using the service-role client (bypasses RLS).
 *   3. Inserts an authoritative audit_log entry with change_reason + field diff.
 *      (The DB trigger also fires and creates a secondary entry without change_reason —
 *       the audit log UI filters to change_reason IS NOT NULL to show only admin-initiated ones.)
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionState = { error: string } | null;

// ─── Public cache invalidation ───────────────────────────────────────────────

/**
 * After any admin mutation, revalidate the SSG public pages for the affected
 * subject so students immediately see the updated omission state.
 *
 * Uses `'layout'` type so Next.js invalidates the subject page AND all
 * chapter pages nested underneath it in one call.
 */
async function revalidatePublicPages(
  db: ReturnType<typeof createAdminClient>,
  subjectId: string
): Promise<void> {
  const { data } = await db
    .from("subjects")
    .select("slug, class_id")
    .eq("id", subjectId)
    .single();
  if (!data) return;
  const { slug, class_id } = data as { slug: string; class_id: number };
  // Invalidates the subject overview + all chapter pages under it
  revalidatePath(`/class/${class_id}/subject/${slug}`, "layout");
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

/**
 * Resolves the current session user and confirms they are an admin.
 * Redirects to /auth/login or / on failure (never returns).
 */
async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const row = data as { role: string } | null;
  if (row?.role !== "admin") redirect("/");

  return user.id;
}

// ─── Update omission ──────────────────────────────────────────────────────────

export async function updateOmission(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actorId = await requireAdmin();
  const db = createAdminClient();

  const omissionId = formData.get("omission_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const status = formData.get("status") as string;
  const notesMd =
    ((formData.get("notes_md") as string) || "").trim() || null;
  const changeReason = (
    (formData.get("change_reason") as string) || ""
  ).trim();

  if (!changeReason) return { error: "Change reason is required." };
  if (!["omitted", "included", "partial"].includes(status)) {
    return { error: "Invalid status value." };
  }

  // Snapshot old values to build a field-level diff
  const { data: oldRow } = await db
    .from("omissions")
    .select("status, notes_md")
    .eq("id", omissionId)
    .single();
  const old = oldRow as { status: string; notes_md: string | null } | null;

  // Perform update (omissions_audit trigger fires automatically)
  const { error: updateErr } = await db
    .from("omissions")
    .update({ status, notes_md: notesMd })
    .eq("id", omissionId);
  if (updateErr) return { error: updateErr.message };

  // Build field-level diff for the authoritative audit entry
  const diff: Record<string, { old: unknown; new: unknown }> = {};
  if (old?.status !== status) diff.status = { old: old?.status, new: status };
  if (old?.notes_md !== notesMd) {
    diff.notes_md = { old: old?.notes_md, new: notesMd };
  }

  // Insert authoritative audit entry with actor + change_reason
  await db.from("audit_log").insert({
    actor_user_id: actorId,
    entity_table: "omissions",
    entity_id: omissionId,
    action: "update",
    change_reason: changeReason,
    diff_jsonb: diff,
  });

  await revalidatePublicPages(db, subjectId);
  revalidatePath(`/admin/subjects/${subjectId}`);
  revalidatePath("/admin");
  redirect(`/admin/subjects/${subjectId}`);
}

// ─── Soft-delete topic ────────────────────────────────────────────────────────

export async function softDeleteTopic(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actorId = await requireAdmin();
  const db = createAdminClient();

  const topicId = formData.get("topic_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const changeReason = (
    (formData.get("change_reason") as string) || ""
  ).trim();

  if (!changeReason) return { error: "Change reason is required." };

  const { error } = await db
    .from("topics")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", topicId)
    .is("deleted_at", null);
  if (error) return { error: error.message };

  await db.from("audit_log").insert({
    actor_user_id: actorId,
    entity_table: "topics",
    entity_id: topicId,
    action: "delete",
    change_reason: changeReason,
    diff_jsonb: null,
  });

  await revalidatePublicPages(db, subjectId);
  revalidatePath(`/admin/subjects/${subjectId}`);
  revalidatePath("/admin");
  redirect(`/admin/subjects/${subjectId}`);
}

// ─── Soft-delete chapter ──────────────────────────────────────────────────────

export async function softDeleteChapter(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actorId = await requireAdmin();
  const db = createAdminClient();

  const chapterId = formData.get("chapter_id") as string;
  const subjectId = formData.get("subject_id") as string;
  const changeReason = (
    (formData.get("change_reason") as string) || ""
  ).trim();

  if (!changeReason) return { error: "Change reason is required." };

  const { error } = await db
    .from("chapters")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", chapterId)
    .is("deleted_at", null);
  if (error) return { error: error.message };

  await db.from("audit_log").insert({
    actor_user_id: actorId,
    entity_table: "chapters",
    entity_id: chapterId,
    action: "delete",
    change_reason: changeReason,
    diff_jsonb: null,
  });

  await revalidatePublicPages(db, subjectId);
  revalidatePath(`/admin/subjects/${subjectId}`);
  revalidatePath("/admin");
  redirect(`/admin/subjects/${subjectId}`);
}
