import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * A Supabase client that acts as the signed-in user, so Row Level Security applies to every query.
 *
 * Supabase Edge Functions are given SUPABASE_URL and SUPABASE_ANON_KEY automatically.
 * SUPABASE_PUBLISHABLE_KEY is accepted first for platforms that provide it under that name.
 * Read at call time, never at module load (the entry must import cleanly).
 */
export function supabaseForUser(ctx: ToolContext) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured for this function");

  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
