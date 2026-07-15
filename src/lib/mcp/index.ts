import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchMedia from "./tools/search-media";
import getWatchlist from "./tools/get-watchlist";
import addToWatchlist from "./tools/add-to-watchlist";
import removeFromWatchlist from "./tools/remove-from-watchlist";
import updateWatchlistItem from "./tools/update-watchlist-item";

// Supabase direct issuer — mcp-js rejects tokens if the configured issuer
// doesn't match the one advertised by the discovery document.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "watchlist-mcp",
  title: "Watchlist",
  version: "0.1.0",
  instructions:
    "Tools for the Watchlist app. Search TMDB movies and TV shows, then read and manage the signed-in user's watchlist (add, remove, update status and rating).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchMedia, getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistItem],
});
