/**
 * Admin layout — checks that the current user has role = 'admin'.
 * Non-admins are redirected: unauthenticated → /auth/login, wrong role → /.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | ICSE Syllabus",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");

  const { data } = await supabase
    .from("users")
    .select("role, display_name, email")
    .eq("id", user.id)
    .single();
  const profile = data as {
    role: string;
    display_name: string | null;
    email: string;
  } | null;

  if (profile?.role !== "admin") redirect("/");

  const label = profile.display_name ?? profile.email ?? "Admin";

  return (
    <div className="space-y-6">
      {/* Admin navigation bar */}
      <div className="-mx-4 px-4 py-2.5 border-b bg-amber-50 dark:bg-amber-950/20 flex items-center justify-between text-sm">
        <nav className="flex items-center gap-5">
          <span className="font-bold text-amber-700 dark:text-amber-400 text-xs tracking-widest uppercase">
            Admin
          </span>
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/subjects"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Subjects
          </Link>
          <Link
            href="/admin/audit"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Audit Log
          </Link>
        </nav>
        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}
