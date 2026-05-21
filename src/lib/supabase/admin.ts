/**
 * Service-role Supabase client — bypasses ALL Row Level Security.
 *
 * ONLY use in server-side code: Server Components, Server Actions, Route Handlers.
 * Never import this in a client component or expose the key to the browser.
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY — admin client unavailable"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
