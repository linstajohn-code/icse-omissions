/**
 * RLS (Row Level Security) Playwright tests.
 *
 * Proves the Phase 3 security invariants:
 *   ✓ Unauthenticated user cannot create bookmarks or progress entries.
 *   ✓ A student cannot read another student's bookmarks or progress.
 *   ✓ A student cannot mutate omissions (direct Supabase REST call).
 *   ✓ Admin service-role can read audit_log; student cannot.
 *
 * Prerequisites:
 *   1. Supabase project running with migrations applied and pnpm db:seed run.
 *   2. .env.local with:
 *        NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 *        SUPABASE_SERVICE_ROLE_KEY,
 *        E2E_USER_A_EMAIL, E2E_USER_A_PASSWORD,
 *        E2E_USER_B_EMAIL, E2E_USER_B_PASSWORD
 *      (Both users pre-created in Supabase Auth with password provider enabled.)
 *   3. Server running on port 3000 (playwright.config.ts starts it automatically).
 *
 * Run: pnpm test:e2e
 */

import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// ─── helpers ────────────────────────────────────────────────────────────────

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
}

// Admin client uses service role — bypasses RLS for test setup/teardown.
// We intentionally do NOT pass a typed Database here to avoid the supabase-js
// type-narrowing issues in test helpers; we cast explicitly below.
function adminClient() {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

/** Sign in via password grant so tests don't depend on email magic links. */
async function signInViaPage(page: Page, email: string, password: string): Promise<void> {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const tokens = await page.evaluate(
    async ({ url, anon, email, password }) => {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as Record<string, string>;
      if (!data["access_token"])
        throw new Error("Sign-in failed: " + JSON.stringify(data));
      return data as { access_token: string; refresh_token: string };
    },
    { url, anon, email, password }
  );

  await page.goto("/");
  await page.evaluate(
    ({ at, rt }) => {
      document.cookie = `sb-access-token=${at}; path=/`;
      document.cookie = `sb-refresh-token=${rt}; path=/`;
    },
    { at: tokens["access_token"], rt: tokens["refresh_token"] }
  );
}

/** Find user UUID by email (via admin listUsers). */
async function getUserId(email: string): Promise<string> {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email === email);
  if (!user) throw new Error(`User not found in Supabase Auth: ${email}`);
  return user.id;
}

/** Get the Supabase UUID for seeded Class 9 Mathematics chapter 1 topic 1. */
async function getTestTopicId(): Promise<string> {
  const admin = adminClient();

  const { data: sData } = await admin
    .from("subjects")
    .select("id")
    .eq("class_id", 9)
    .eq("slug", "mathematics")
    .single();
  const subjectId = (sData as { id: string } | null)?.id;
  if (!subjectId) throw new Error("subject not found — run pnpm db:seed first");

  const { data: cData } = await admin
    .from("chapters")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("order", 1)
    .single();
  const chapterId = (cData as { id: string } | null)?.id;
  if (!chapterId) throw new Error("chapter not found — run pnpm db:seed first");

  const { data: tData } = await admin
    .from("topics")
    .select("id")
    .eq("chapter_id", chapterId)
    .eq("order", 1)
    .single();
  const topicId = (tData as { id: string } | null)?.id;
  if (!topicId) throw new Error("topic not found — run pnpm db:seed first");

  return topicId;
}

// ─── shared state ────────────────────────────────────────────────────────────

let sharedTopicId: string;

test.beforeAll(async () => {
  sharedTopicId = await getTestTopicId();
});

// ─── tests ───────────────────────────────────────────────────────────────────

test.describe("Unauthenticated user", () => {
  test("cannot create a bookmark (401)", async ({ request }) => {
    const res = await request.post("/api/bookmarks", {
      data: { key: "9/mathematics/1/1", bookmarked: true },
    });
    expect(res.status()).toBe(401);
  });

  test("cannot update progress (401)", async ({ request }) => {
    const res = await request.put("/api/progress", {
      data: { key: "9/mathematics/1/1", status: "revised" },
    });
    expect(res.status()).toBe(401);
  });

  test("can read public syllabus pages (200)", async ({ page }) => {
    await page.goto("/class/9");
    await expect(page).toHaveTitle(/ICSE/);
  });
});

test.describe("Student A vs Student B isolation", () => {
  test("Student A bookmark is invisible to Student B", async ({ browser }) => {
    const admin = adminClient();
    const userAId = await getUserId(getEnv("E2E_USER_A_EMAIL"));

    await admin
      .from("bookmarks")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ user_id: userAId, topic_id: sharedTopicId } as any, {
        onConflict: "user_id,topic_id",
        ignoreDuplicates: false,
      });

    const pageB = await browser.newPage();
    await signInViaPage(pageB, getEnv("E2E_USER_B_EMAIL"), getEnv("E2E_USER_B_PASSWORD"));

    const res = await pageB.request.get("/api/bookmarks?keys=9/mathematics/1/1");
    const body = (await res.json()) as { bookmarked: string[] };
    expect(body.bookmarked).not.toContain("9/mathematics/1/1");

    await admin
      .from("bookmarks")
      .delete()
      .eq("user_id", userAId)
      .eq("topic_id", sharedTopicId);
    await pageB.close();
  });

  test("Student A progress is invisible to Student B", async ({ browser }) => {
    const admin = adminClient();
    const userAId = await getUserId(getEnv("E2E_USER_A_EMAIL"));

    await admin
      .from("user_progress")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ user_id: userAId, topic_id: sharedTopicId, status: "revised" } as any, {
        onConflict: "user_id,topic_id",
      });

    const pageB = await browser.newPage();
    await signInViaPage(pageB, getEnv("E2E_USER_B_EMAIL"), getEnv("E2E_USER_B_PASSWORD"));

    const res = await pageB.request.get("/api/progress?keys=9/mathematics/1/1");
    const body = (await res.json()) as { progress: Record<string, string> };
    expect(body.progress["9/mathematics/1/1"] ?? "not_started").not.toBe("revised");

    await admin
      .from("user_progress")
      .delete()
      .eq("user_id", userAId)
      .eq("topic_id", sharedTopicId);
    await pageB.close();
  });
});

test.describe("Student cannot mutate omissions", () => {
  test("direct REST INSERT on omissions is rejected by RLS", async ({ browser }) => {
    const pageA = await browser.newPage();
    await signInViaPage(pageA, getEnv("E2E_USER_A_EMAIL"), getEnv("E2E_USER_A_PASSWORD"));

    const status = await pageA.evaluate(
      async ({ url, anon, topicId }) => {
        const at = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("sb-access-token="))
          ?.split("=")[1];

        const res = await fetch(`${url}/rest/v1/omissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anon,
            Authorization: `Bearer ${at ?? anon}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            topic_id: topicId,
            status: "omitted",
            source_page: 1,
            source_excerpt: "HACKED",
            effective_session: "2027-28",
          }),
        });
        return res.status;
      },
      {
        url: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        anon: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        topicId: sharedTopicId,
      }
    );

    expect([401, 403, 404]).toContain(status);
    await pageA.close();
  });
});

test.describe("Audit log access", () => {
  test("service role can read audit_log", async () => {
    const admin = adminClient();
    const { error } = await admin.from("audit_log").select("id").limit(1);
    expect(error).toBeNull();
  });

  test("student cannot read audit_log rows", async ({ browser }) => {
    const pageA = await browser.newPage();
    await signInViaPage(pageA, getEnv("E2E_USER_A_EMAIL"), getEnv("E2E_USER_A_PASSWORD"));

    const result = await pageA.evaluate(
      async ({ url, anon }) => {
        const at = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("sb-access-token="))
          ?.split("=")[1];

        const res = await fetch(`${url}/rest/v1/audit_log?select=id&limit=1`, {
          headers: {
            apikey: anon,
            Authorization: `Bearer ${at ?? anon}`,
          },
        });
        const body = (await res.json()) as unknown;
        return {
          status: res.status,
          rowCount: Array.isArray(body) ? body.length : -1,
        };
      },
      {
        url: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
        anon: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      }
    );

    // Student should get 403 or 0 rows (RLS — admin only)
    expect(result.status === 403 || result.rowCount === 0).toBeTruthy();
    await pageA.close();
  });
});
