/**
 * Server Component — reads the current user from Supabase cookies and renders
 * either a "Sign in" link or the user's initials + sign-out button.
 */
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";

export async function UserNav({ currentPath }: { currentPath?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href={`/auth/login${currentPath ? `?next=${encodeURIComponent(currentPath)}` : ""}`}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <User className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  const initials = (user.email ?? "?")
    .split("@")[0]!
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/account"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
        aria-label={`Account: ${user.email}`}
      >
        {initials}
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
