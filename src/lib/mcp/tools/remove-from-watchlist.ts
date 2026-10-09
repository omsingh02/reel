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
  name: "remove_from_watchlist",
  title: "Remove from watchlist",
  description: "Remove a movie or TV show from the signed-in user's Reel list by TMDB id and type.",
  inputSchema: {
    tmdb_id: z.number().int().positive(),
    type: z.enum(["movie", "tv"]),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ tmdb_id, type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { error, count } = await supabase
      .from("watchlist_items")
      .delete({ count: "exact" })
      .eq("user_id", ctx.getUserId())
      .eq("tmdb_id", tmdb_id)
      .eq("tmdb_type", type);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: count && count > 0 ? "Removed." : "Item was not in your list." }],
    };
  },
});
