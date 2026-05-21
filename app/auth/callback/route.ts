/**
 * Supabase Auth callback — exchanges the auth code for a session.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/class/9";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        const displayName =
          (user.user_metadata["full_name"] as string | undefined) ?? null;
        // reason: supabase-js without Database generic requires cast
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userRow: any = { id: user.id, email: user.email, display_name: displayName, role: "student" };
        await supabase
          .from("users")
          .upsert(userRow, { onConflict: "id", ignoreDuplicates: true });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
