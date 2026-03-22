import { useState } from 'react';
import { X, MonitorPlay, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { MediaType } from '@/types/tmdb';

interface StreamPlayerProps {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  season?: number;
  episode?: number;
  onClose: () => void;
}

interface StreamSource {
  name: string;
  getUrl: (tmdbId: number, mediaType: MediaType, season?: number, episode?: number) => string;
  sandbox: boolean;
}

const sources: StreamSource[] = [
  {
    name: 'VidSrc',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.xyz/embed/${type}/${id}`,
    sandbox: true,
  },
  {
    name: 'Embed.su',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://embed.su/embed/${type}/${id}/${s}/${e}`
        : `https://embed.su/embed/${type}/${id}`,
    sandbox: true,
  },
  {
    name: 'SmashyStream',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://player.smashy.stream/${type}/${id}?s=${s}&e=${e}`
        : `https://player.smashy.stream/${type}/${id}`,
    sandbox: true,
  },
  {
    name: 'VidLink',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://vidlink.pro/tv/${id}/${s}/${e}`
        : `https://vidlink.pro/${type}/${id}`,
    sandbox: false,
  },
  {
    name: '2Embed',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://www.2embed.online/embed/tv/${id}/${s}/${e}`
        : `https://www.2embed.online/embed/${type}/${id}`,
    sandbox: true,
  },
  {
    name: 'VidBinge',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://vidbinge.to/tv/${id}/${s}/${e}`
        : `https://vidbinge.to/${type}/${id}`,
    sandbox: false,
  },
  {
    name: 'VikingEmbed',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://vembed.stream/play/${id}/${s}/${e}`
        : `https://vembed.stream/play/${id}`,
    sandbox: false,
  },
  {
    name: 'AutoEmbed',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://autoembed.co/${type}/tmdb/${id}-${s}-${e}`
        : `https://autoembed.co/${type}/tmdb/${id}`,
    sandbox: false,
  },
  {
    name: '2Embed.cc',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`,
    sandbox: false,
  },
  {
    name: 'SuperEmbed',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://multiembed.mov/?tmdb=1&video_id=${id}&s=${s}&e=${e}`
        : `https://multiembed.mov/?tmdb=1&video_id=${id}`,
    sandbox: false,
  },
  {
    name: 'MoviesAPI',
    getUrl: (id, type, s, e) =>
      type === 'tv' && s && e
        ? `https://moviesapi.club/tv/${id}-${s}-${e}`
        : `https://moviesapi.club/movie/${id}`,
    sandbox: false,
  },
];

export function StreamPlayer({ tmdbId, mediaType, title, season, episode, onClose }: StreamPlayerProps) {
  const [activeSource, setActiveSource] = useState(sources[0]);

  const embedUrl = activeSource.getUrl(tmdbId, mediaType, season, episode);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" onClick={onClose}>
      <div
        className="flex-1 flex flex-col max-w-7xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <MonitorPlay className="h-5 w-5 text-primary shrink-0" />
            <h3 className="text-sm font-medium text-white truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Source selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-1.5 rounded-lg h-8 px-3 text-xs">
                  {activeSource.name}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[140px] z-[70]">
                {sources.map((source) => (
                  <DropdownMenuItem
                    key={source.name}
                    onClick={() => setActiveSource(source)}
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
              className="text-white hover:bg-white/10 h-8 w-8 p-0 rounded-lg"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Embed iframe */}
        <div className="flex-1 px-2 pb-2">
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full rounded-xl border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
            {...(activeSource.sandbox ? { sandbox: "allow-forms allow-scripts allow-same-origin allow-popups allow-presentation" } : {})}
          />
        </div>
      </div>
    </div>
  );
}
