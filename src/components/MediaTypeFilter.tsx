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
    <div className={cn("inline-flex rounded-full p-1 bg-secondary/40", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-2.5 sm:px-3 text-sm font-medium rounded-full transition-all",
          value === 'movie' 
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
            : "hover:bg-secondary/60"
        )}
        onClick={() => onChange('movie')}
      >
        <Film className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Movies</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-2.5 sm:px-3 text-sm font-medium rounded-full transition-all",
          value === 'tv' 
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
            : "hover:bg-secondary/60"
        )}
        onClick={() => onChange('tv')}
      >
        <Tv className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">TV Shows</span>
      </Button>
    </div>
  );
}
