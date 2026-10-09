import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_watchlist_item",
  title: "Update watchlist item",
  description:
    "Update the status ('watchlist' = to watch, 'watched') and/or personal rating of an existing item in the user's Reel list. Marking an item watched stamps watched_at (unless it was already watched); moving it back to 'watchlist' clears it.",
  inputSchema: {
    tmdb_id: z.number().int().positive(),
    type: z.enum(["movie", "tv"]),
    status: z.enum(["watchlist", "watched"]).optional(),
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
    if (status === undefined && rating === undefined) {
      return { content: [{ type: "text", text: "Nothing to update." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const patch: Record<string, unknown> = {};
    if (status !== undefined) {
      patch.status = status;
      if (status === "watched") {
        // Keep the original watched date if the item is already watched.
        const { data: current, error: readError } = await supabase
          .from("watchlist_items")
          .select("status, watched_at")
          .eq("user_id", ctx.getUserId())
          .eq("tmdb_id", tmdb_id)
          .eq("tmdb_type", type)
          .maybeSingle();
        if (readError) return { content: [{ type: "text", text: readError.message }], isError: true };
        if (!current) return { content: [{ type: "text", text: "Item not found in your list." }], isError: true };
        if (!(current.status === "watched" && current.watched_at)) {
          patch.watched_at = new Date().toISOString();
        }
      } else {
        patch.watched_at = null;
      }
    }
    if (rating !== undefined) patch.rating = rating;

    const { data, error } = await supabase
      .from("watchlist_items")
      .update(patch)
      .eq("user_id", ctx.getUserId())
      .eq("tmdb_id", tmdb_id)
      .eq("tmdb_type", type)
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Item not found in your list." }], isError: true };

    return {
      content: [{ type: "text", text: `Updated "${data.title}".` }],
      structuredContent: { item: data },
    };
  },
});
