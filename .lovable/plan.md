

## Add More Streaming Sources

Based on research, here are additional embed providers that support TMDB IDs and can be added to the existing 8 sources in `StreamPlayer.tsx`.

### New sources to add

| Source | Movie URL | TV URL | Sandbox |
|--------|-----------|--------|---------|
| **2Embed.cc** | `https://www.2embed.cc/embed/{id}` | `https://www.2embed.cc/embedtv/{id}&s={s}&e={e}` | false |
| **SuperEmbed** | `https://multiembed.mov/?tmdb=1&video_id={id}` | `https://multiembed.mov/?tmdb=1&video_id={id}&s={s}&e={e}` | false |
| **MoviesAPI** | `https://moviesapi.club/movie/{id}` | `https://moviesapi.club/tv/{id}-{s}-{e}` | false |
| **VidEmbed** | `https://www.vidembed.site/movies-{id}` | N/A (TV coming soon) | false |

### File changes

**`src/components/StreamPlayer.tsx`** — Add 3-4 new entries to the `sources` array after the existing AutoEmbed entry. VidEmbed will be movie-only (returns movie URL for TV as well, since their TV support isn't live yet — skip this one to avoid confusion). The three reliable additions are **2Embed.cc**, **SuperEmbed (MultiEmbed)**, and **MoviesAPI**.

Each new source follows the same `StreamSource` interface pattern with `name`, `getUrl`, and `sandbox: false` (these providers tend to block sandboxed iframes).

