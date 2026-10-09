import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { tmdbFailed, tmdbGet, toolError } from "../tmdb";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "add_to_watchlist",
  title: "Add to watchlist",
  description:
    "Add a movie or TV show to the signed-in user's list in Reel. Provide the TMDB id and type; title/metadata are fetched automatically. If the title is already in the list it is left unchanged.",
  inputSchema: {
    tmdb_id: z.number().int().positive().describe("TMDB numeric id."),
    type: z.enum(["movie", "tv"]).describe("Media type."),
    status: z
      .enum(["watchlist", "watched"])
      .optional()
      .describe("Initial status (default: watchlist)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ tmdb_id, type, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const details = await tmdbGet<{
      title?: string;
      name?: string;
      poster_path?: string | null;
      release_date?: string;
      first_air_date?: string;
      vote_average?: number;
      runtime?: number;
      episode_run_time?: number[];
    }>(`${type}/${tmdb_id}`);
    if (tmdbFailed(details)) {
      return toolError(details.kind === "http" ? `TMDB item not found (${details.status}).` : details.message);
    }
    const d = details.data;

    const supabase = supabaseForUser(ctx);
    const row = {
      user_id: ctx.getUserId(),
      tmdb_id,
      tmdb_type: type,
      title: d.title ?? d.name ?? "Untitled",
      poster_path: d.poster_path ?? null,
      release_date: d.release_date ?? d.first_air_date ?? null,
      vote_average: d.vote_average ?? null,
      status: status ?? "watchlist",
      watched_at: status === "watched" ? new Date().toISOString() : null,
      runtime: d.runtime ?? d.episode_run_time?.[0] ?? null,
    };

    // ON CONFLICT DO NOTHING: never overwrite status/rating/watched_at of an existing row.
    const { data, error } = await supabase
      .from("watchlist_items")
      .upsert(row, { onConflict: "user_id,tmdb_id,tmdb_type", ignoreDuplicates: true })
      .select()
      .maybeSingle();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: "Already in your list." }] };
    }

    return {
      content: [{ type: "text", text: `Added "${row.title}" to your list.` }],
      structuredContent: { item: data },
    };
  },
});
