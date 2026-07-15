import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default defineTool({
  name: "add_to_watchlist",
  title: "Add to watchlist",
  description:
    "Add a movie or TV show to the signed-in user's watchlist. Provide the TMDB id and type; title/metadata are fetched automatically.",
  inputSchema: {
    tmdb_id: z.number().int().positive().describe("TMDB numeric id."),
    type: z.enum(["movie", "tv"]).describe("Media type."),
    status: z
      .enum(["watchlist", "watching", "watched"])
      .optional()
      .describe("Initial status (default: watchlist)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ tmdb_id, type, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "TMDB API key not configured." }], isError: true };
    }

    const detailsRes = await fetch(`${TMDB_BASE_URL}/${type}/${tmdb_id}?api_key=${apiKey}`);
    if (!detailsRes.ok) {
      return { content: [{ type: "text", text: `TMDB item not found (${detailsRes.status}).` }], isError: true };
    }
    const d = (await detailsRes.json()) as {
      title?: string;
      name?: string;
      poster_path?: string | null;
      release_date?: string;
      first_air_date?: string;
      vote_average?: number;
      runtime?: number;
      episode_run_time?: number[];
    };

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
      runtime: d.runtime ?? d.episode_run_time?.[0] ?? null,
    };

    const { data, error } = await supabase
      .from("watchlist_items")
      .upsert(row, { onConflict: "user_id,tmdb_id,tmdb_type" })
      .select()
      .maybeSingle();

    if (error) {
      // If no unique constraint exists, fall back to insert-if-absent.
      const { data: existing } = await supabase
        .from("watchlist_items")
        .select("id")
        .eq("user_id", ctx.getUserId())
        .eq("tmdb_id", tmdb_id)
        .eq("tmdb_type", type)
        .maybeSingle();
      if (existing) {
        return { content: [{ type: "text", text: "Already in watchlist." }] };
      }
      const { error: insertError } = await supabase.from("watchlist_items").insert(row);
      if (insertError) {
        return { content: [{ type: "text", text: insertError.message }], isError: true };
      }
      return { content: [{ type: "text", text: `Added "${row.title}" to watchlist.` }] };
    }

    return {
      content: [{ type: "text", text: `Added "${row.title}" to watchlist.` }],
      structuredContent: { item: data },
    };
  },
});
