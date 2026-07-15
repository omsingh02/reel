import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w342";

type TmdbSearchItem = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  vote_average?: number;
  poster_path?: string | null;
};

export default defineTool({
  name: "search_media",
  title: "Search movies and TV shows",
  description:
    "Search TMDB for movies and TV shows by title. Returns up to 10 matches with id, type, title, year, rating, and overview.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Title to search for."),
    type: z
      .enum(["movie", "tv", "multi"])
      .optional()
      .describe("Restrict results to movies, TV shows, or both (default: multi)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, type }) => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "TMDB API key not configured." }], isError: true };
    }
    const endpoint = type && type !== "multi" ? `search/${type}` : "search/multi";
    const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&page=1`;
    const res = await fetch(url);
    if (!res.ok) {
      return { content: [{ type: "text", text: `TMDB error: ${res.status}` }], isError: true };
    }
    const data = (await res.json()) as { results?: TmdbSearchItem[] };
    const results = (data.results ?? [])
      .filter((r) => r.poster_path && (r.media_type ?? type) !== "person")
      .slice(0, 10)
      .map((r) => {
        const mediaType = (r.media_type ?? type ?? "movie") as "movie" | "tv";
        const title = r.title ?? r.name ?? "Untitled";
        const date = r.release_date ?? r.first_air_date ?? "";
        return {
          tmdb_id: r.id,
          type: mediaType,
          title,
          year: date ? date.slice(0, 4) : null,
          vote_average: r.vote_average ?? null,
          overview: r.overview ?? "",
          poster_url: r.poster_path ? `${IMG}${r.poster_path}` : null,
        };
      });

    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { results },
    };
  },
});
