import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_watchlist",
  title: "Get watchlist",
  description:
    "Return the signed-in user's Reel list, optionally filtered by status ('watchlist' = to watch, 'watched').",
  inputSchema: {
    status: z
      .enum(["watchlist", "watched"])
      .optional()
      .describe("Filter by status. Omit to return all items."),
    limit: z.number().int().min(1).max(200).optional().describe("Max items to return (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("watchlist_items")
      .select("tmdb_id, tmdb_type, title, release_date, vote_average, status, rating, watched_at, added_at")
      .eq("user_id", ctx.getUserId())
      .order("added_at", { ascending: false })
      .limit(limit ?? 100);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
