import type { ReactNode } from 'react';
import { Check, CheckCircle2, MonitorPlay, Play, Plus } from 'lucide-react';
import { BrandIcon } from '@/components/BrandIcon';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TitleActionsProps {
  inWatchlist: boolean;
  watchedNow: boolean;
  hasTrailer: boolean;
  onWatchNow: () => void;
  onToggleList: () => void;
  onTrailer: () => void;
  onToggleWatched: () => void;
  share: ReactNode;
  externalLinks: { name: string; url: string }[];
}

/** Everything you can do with a title, in order of how often people do it. */
export function TitleActions({
  inWatchlist, watchedNow, hasTrailer, onWatchNow, onToggleList, onTrailer, onToggleWatched, share, externalLinks,
}: TitleActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Button size="lg" className="flex-1 sm:flex-none sm:px-7" onClick={onWatchNow}>
        <Play className="fill-current" />
        Watch Now
      </Button>

      <Button size="lg" variant="secondary" onClick={onToggleList}>
        {inWatchlist ? <><Check className="text-primary-text" strokeWidth={3} />In My List</> : <><Plus />My List</>}
      </Button>

      {hasTrailer && (
        <Button size="lg" variant="secondary" onClick={onTrailer}>
          <MonitorPlay />
          Trailer
        </Button>
      )}

      <Button
        size="lg"
        variant="secondary"
        onClick={onToggleWatched}
        className={cn(watchedNow && 'border-success/45 bg-success-subtle text-success-text hover:bg-success-subtle hover:brightness-110')}
      >
        <CheckCircle2 />
        {watchedNow ? 'Watched' : 'Mark watched'}
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {share}
        {externalLinks.map(link => (
          <Tooltip key={link.name}>
            <TooltipTrigger asChild>
              <Button asChild size="icon-lg" variant="secondary">
                <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`Open on ${link.name}`}>
                  <BrandIcon name={link.name} className={link.name === 'IMDb' ? '!size-auto h-4 w-8' : ''} />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{link.name === 'IMDb' ? 'IMDb' : link.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
