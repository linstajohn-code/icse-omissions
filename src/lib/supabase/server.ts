/**
 * Server-side Supabase client — use in Server Components, Route Handlers, and
 * Server Actions. Reads session from cookies (set by middleware).
 *
 * Must be called inside an async function; cookies() is async in Next.js 15.
 *
 * Note: we don't pass the Database generic here because the hand-written type
 * definition doesn't include the Relationships field required by supabase-js
 * inference. Use explicit row-type casts at call sites instead.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Components where cookies are read-only.
            // Middleware will refresh the session before the next request.
          }
        },
      },
    }
  );
}
