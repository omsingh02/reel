import { Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MediaType } from '@/types/tmdb';

interface MediaTypeFilterProps {
  value: MediaType;
  onChange: (type: MediaType) => void;
  className?: string;
}

export function MediaTypeFilter({ value, onChange, className }: MediaTypeFilterProps) {
  return (
    <div className={cn("inline-flex rounded-md border border-border p-1 bg-secondary/30", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 text-sm font-medium rounded-sm",
          value === 'movie' && "bg-background shadow-sm"
        )}
        onClick={() => onChange('movie')}
      >
        <Film className="h-4 w-4 mr-1.5" />
        Movies
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 text-sm font-medium rounded-sm",
          value === 'tv' && "bg-background shadow-sm"
        )}
        onClick={() => onChange('tv')}
      >
        <Tv className="h-4 w-4 mr-1.5" />
        TV Shows
      </Button>
    </div>
  );
}
