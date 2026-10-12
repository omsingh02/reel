const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TIMEOUT_MS = 8000;

/**
 * What MCP clients see when TMDB can't be reached. Fetch errors can embed the
 * full request URL, and ours carries `api_key=...`, so the raw error message must
 * never be forwarded to a client (or logged unredacted).
 */
export const TMDB_UNAVAILABLE_MESSAGE = "TMDB is unreachable or timed out";

/** Blank out `api_key=...` query values in anything that is about to be logged. */
export function redactApiKey(text: string): string {
  return text.replace(/api_key=[^&\s"')]+/gi, "api_key=REDACTED");
}

export interface TmdbSuccess<T> {
  ok: true;
  data: T;
}
export interface TmdbFailure {
  ok: false;
  kind: "config" | "network" | "http" | "parse";
  status?: number;
  message: string;
}
export type TmdbResult<T> = TmdbSuccess<T> | TmdbFailure;

/** Type guard: the project doesn't use strict mode, so `!res.ok` alone wouldn't narrow the union. */
export function tmdbFailed<T>(result: TmdbResult<T>): result is TmdbFailure {
  return !result.ok;
}

function describe(err: unknown): string {
  return redactApiKey(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
}

/**
 * GET a TMDB v3 path with an 8s timeout. Never throws: failures come back as
 * `{ ok: false }` with a message that is safe to show to an MCP client.
 * Reads the API key per call (handlers must not touch env at module load).
 */
export async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<TmdbResult<T>> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return { ok: false, kind: "config", message: "TMDB API key not configured." };

  const query = new URLSearchParams({ api_key: apiKey, ...params });
  let res: Response;
  try {
    res = await fetch(`${TMDB_BASE_URL}/${path}?${query}`, { signal: AbortSignal.timeout(TMDB_TIMEOUT_MS) });
  } catch (err) {
    console.error("[mcp] TMDB request failed:", describe(err));
    return { ok: false, kind: "network", message: TMDB_UNAVAILABLE_MESSAGE };
  }

  if (!res.ok) return { ok: false, kind: "http", status: res.status, message: `TMDB error: ${res.status}` };

  try {
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    // The timeout also covers reading the body, so an abort here is still "unreachable".
    console.error("[mcp] TMDB response unreadable:", describe(err));
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ok: false,
      kind: timedOut ? "network" : "parse",
      message: timedOut ? TMDB_UNAVAILABLE_MESSAGE : "TMDB returned an unexpected response",
    };
  }
}

/** A tool result the MCP client treats as an error. */
export function toolError(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true as const };
}
