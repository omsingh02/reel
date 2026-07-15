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
  name: "update_watchlist_item",
  title: "Update watchlist item",
  description:
    "Update the status and/or personal rating of an existing watchlist item. Setting status to 'watched' stamps the watched_at time.",
  inputSchema: {
    tmdb_id: z.number().int().positive(),
    type: z.enum(["movie", "tv"]),
    status: z.enum(["watchlist", "watching", "watched"]).optional(),
    rating: z
      .number()
      .min(1)
      .max(10)
      .nullable()
      .optional()
      .describe("Personal rating from 1-10. Pass null to clear."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ tmdb_id, type, status, rating }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const patch: Record<string, unknown> = {};
    if (status !== undefined) {
      patch.status = status;
      if (status === "watched") patch.watched_at = new Date().toISOString();
    }
    if (rating !== undefined) patch.rating = rating;

    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "Nothing to update." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("watchlist_items")
      .update(patch)
      .eq("user_id", ctx.getUserId())
      .eq("tmdb_id", tmdb_id)
      .eq("tmdb_type", type)
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Item not found in watchlist." }], isError: true };

    return {
      content: [{ type: "text", text: `Updated "${data.title}".` }],
      structuredContent: { item: data },
    };
  },
});
