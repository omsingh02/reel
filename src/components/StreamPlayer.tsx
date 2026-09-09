import { useEffect, useMemo, useState } from 'react';
import { X, MonitorPlay, ChevronDown, ExternalLink, ShieldOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { MediaType } from '@/types/tmdb';

interface SeasonInfo {
  season_number: number;
  episode_count: number;
  name?: string;
}

interface StreamPlayerProps {
  tmdbId: number;
  /** IMDb id (tt...). Several providers index non-US titles by IMDb only. */
  imdbId?: string | null;
  mediaType: MediaType;
  title: string;
  /** For TV shows: list of seasons (excluding specials) so users can pick S/E. */
  seasons?: SeasonInfo[];
  /** Optional starting season/episode. */
  season?: number;
  episode?: number;
  onClose: () => void;
}

interface Ids {
  tmdb: number;
  imdb?: string | null;
}

interface StreamSource {
  name: string;
  /** Skip the source when it cannot address this title at all. */
  supports?: (ids: Ids) => boolean;
  getUrl: (ids: Ids, mediaType: MediaType, season?: number, episode?: number) => string;
}

/**
 * URL shapes follow each provider's published embed docs. Where a provider
 * accepts both, IMDb ids are preferred: their scrapers key off IMDb for
 * non-US catalogues (Indian/Asian titles frequently resolve only that way).
 */
const sources: StreamSource[] = [
  {
    name: 'VidSrc',
    getUrl: ({ tmdb, imdb }, type, s, e) => {
      const id = imdb ? `imdb=${imdb}` : `tmdb=${tmdb}`;
      return type === 'tv' && s && e
        ? `https://vidsrc.xyz/embed/tv?${id}&season=${s}&episode=${e}`
        : `https://vidsrc.xyz/embed/movie?${id}`;
    },
  },
  {
    name: 'VidSrc.cc',
    getUrl: ({ tmdb, imdb }, type, s, e) => {
      const id = imdb || tmdb;
      return type === 'tv' && s && e
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`;
    },
  },
  {
    name: '2Embed',
    getUrl: ({ tmdb, imdb }, type, s, e) => {
      const id = imdb || tmdb;
      return type === 'tv' && s && e
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`;
    },
  },
  {
    name: 'Embed.su',
    getUrl: ({ tmdb }, type, s, e) =>
      type === 'tv' && s && e
        ? `https://embed.su/embed/tv/${tmdb}/${s}/${e}`
        : `https://embed.su/embed/movie/${tmdb}`,
  },
  {
    name: 'VidLink',
    getUrl: ({ tmdb }, type, s, e) =>
      type === 'tv' && s && e
        ? `https://vidlink.pro/tv/${tmdb}/${s}/${e}`
        : `https://vidlink.pro/movie/${tmdb}`,
  },
  {
    name: 'MoviesAPI',
    getUrl: ({ tmdb }, type, s, e) =>
      type === 'tv' && s && e
        ? `https://moviesapi.club/tv/${tmdb}-${s}-${e}`
        : `https://moviesapi.club/movie/${tmdb}`,
  },
];

const SOURCE_KEY = 'reel:last-source';
const UNSANDBOX_KEY = 'reel:player-full-access';

function readStored(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStored(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

/**
 * Maximum-compatibility sandbox: everything an embedded player and its ad
 * scripts need (popups that escape the sandbox, modals, downloads, storage
 * access) minus top-level navigation, which is the only token that would let
 * a source hijack the whole page. Providers that print "remove sandbox"
 * detect blocked popups/storage, so granting these clears most of them.
 */
const COMPAT_SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-forms',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-modals',
  'allow-downloads',
  'allow-presentation',
  'allow-orientation-lock',
  'allow-pointer-lock',
  'allow-storage-access-by-user-activation',
].join(' ');

export function StreamPlayer({ tmdbId, imdbId, mediaType, title, seasons, season, episode, onClose }: StreamPlayerProps) {
  const ids: Ids = { tmdb: tmdbId, imdb: imdbId || undefined };

  const usable = useMemo(
    () => sources.filter(s => !s.supports || s.supports(ids)),
    [tmdbId, imdbId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [activeSource, setActiveSource] = useState(() => {
    const remembered = readStored(SOURCE_KEY);
    return usable.find(s => s.name === remembered) || usable[0];
  });

  const [fullAccess, setFullAccess] = useState(() => readStored(UNSANDBOX_KEY) === '1');

  const validSeasons = useMemo(
    () => (seasons || []).filter(s => s.season_number > 0 && s.episode_count > 0),
    [seasons]
  );

  const initialSeason = season ?? validSeasons[0]?.season_number ?? 1;
  const [currentSeason, setCurrentSeason] = useState<number>(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState<number>(episode ?? 1);

  const activeSeasonInfo = validSeasons.find(s => s.season_number === currentSeason);
  const episodeCount = activeSeasonInfo?.episode_count ?? 24;

  const isTv = mediaType === 'tv';
  const embedUrl = activeSource.getUrl(
    ids,
    mediaType,
    isTv ? currentSeason : undefined,
    isTv ? currentEpisode : undefined
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selectSource = (source: StreamSource) => {
    setActiveSource(source);
    writeStored(SOURCE_KEY, source.name);
  };

  const toggleFullAccess = () => {
    const next = !fullAccess;
    setFullAccess(next);
    writeStored(UNSANDBOX_KEY, next ? '1' : '0');
  };

  const handleSeasonChange = (value: string) => {
    const s = parseInt(value, 10);
    if (Number.isFinite(s)) {
      setCurrentSeason(s);
      setCurrentEpisode(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" onClick={onClose}>
      <div
        className="flex-1 flex flex-col max-w-7xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <MonitorPlay className="h-5 w-5 text-primary shrink-0" />
            <h3 className="text-sm font-medium text-white truncate">
              {title}
              {isTv && (
                <span className="ml-2 text-white/60">
                  S{currentSeason}·E{currentEpisode}
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* TV season/episode selectors */}
            {isTv && validSeasons.length > 0 && (
              <>
                <Select value={String(currentSeason)} onValueChange={handleSeasonChange}>
                  <SelectTrigger className="h-8 w-[92px] rounded-lg text-xs bg-white/10 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70] max-h-72">
                    {validSeasons.map(s => (
                      <SelectItem key={s.season_number} value={String(s.season_number)}>
                        Season {s.season_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(currentEpisode)}
                  onValueChange={(v) => setCurrentEpisode(parseInt(v, 10) || 1)}
                >
                  <SelectTrigger className="h-8 w-[92px] rounded-lg text-xs bg-white/10 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70] max-h-72">
                    {Array.from({ length: episodeCount }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={String(n)}>
                        Episode {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Source selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-1.5 rounded-lg h-8 px-3 text-xs">
                  {activeSource.name}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[140px] z-[70]">
                {usable.map((source) => (
                  <DropdownMenuItem
                    key={source.name}
                    onClick={() => selectSource(source)}
                    className={cn(
                      "rounded-lg text-sm cursor-pointer",
                      activeSource.name === source.name && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {source.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 h-11 w-11 sm:h-8 sm:w-8 p-0 rounded-lg"
              onClick={onClose}
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Embed iframe */}
        <div className="flex-1 px-2">
          <iframe
            key={`${embedUrl}|${fullAccess}`}
            src={embedUrl}
            title={`${title} player`}
            className="w-full h-full rounded-xl border-0 bg-black"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="origin"
            {...(fullAccess ? {} : { sandbox: COMPAT_SANDBOX })}
          />
        </div>

        {/* Footer: escape hatches for the two real failure modes */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 shrink-0 text-[11px] text-white/50">
          <span className="truncate">
            {fullAccess
              ? 'Full access on — this source can open pages on its own.'
              : 'If the player asks you to “remove sandbox”, turn on full access.'}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullAccess}
              className="h-8 gap-1.5 rounded-lg px-2 text-[11px] text-white/70 hover:bg-white/10 hover:text-white"
            >
              {fullAccess ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {fullAccess ? 'Full access on' : 'Allow full access'}
            </Button>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
