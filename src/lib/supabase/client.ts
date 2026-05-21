/**
 * Browser-side Supabase client — call once, reuse everywhere in Client Components.
 * Session is stored in cookies (not localStorage) so Server Components can also
 * read the session without an extra roundtrip.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
