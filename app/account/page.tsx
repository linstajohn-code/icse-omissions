import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Bookmark, CheckSquare, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/account");

  // Fetch stats
  const [bookmarkRes, progressRes] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("user_progress")
      .select("status")
      .eq("user_id", user.id)
      .neq("status", "not_started"),
  ]);

  const bookmarkCount = bookmarkRes.count ?? 0;
  type ProgressRow = { status: string };
  const revisedCount =
    ((progressRes.data ?? []) as ProgressRow[]).filter((r) => r.status === "revised").length;

  const initials = (user.email ?? "?")
    .split("@")[0]!
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
          {initials}
        </div>
        <div>
          <p className="font-semibold">{user.email}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {(user.app_metadata["role"] as string | undefined) ?? "student"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <Bookmark className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="text-2xl font-bold">{bookmarkCount}</p>
            <p className="text-xs text-muted-foreground">Bookmarks</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="text-2xl font-bold">{revisedCount}</p>
            <p className="text-xs text-muted-foreground">Revised</p>
          </div>
        </div>
      </div>

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
