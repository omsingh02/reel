import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getGenres } from '@/lib/tmdb';
import type { MediaType } from '@/types/tmdb';

export interface CatalogFilters {
  genre: string;
  year: string;
  minRating: string;
  sort: string;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  genre: '',
  year: '',
  minRating: '',
  sort: 'popularity.desc',
};

export function hasActiveFilters(f: CatalogFilters): boolean {
  return !!f.genre || !!f.year || !!f.minRating || f.sort !== DEFAULT_FILTERS.sort;
}

const ANY = '__any';
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => String(CURRENT_YEAR - i));
const RATINGS = ['9', '8', '7', '6', '5'];

interface FiltersBarProps {
  mediaType: MediaType;
  value: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  className?: string;
}

export function FiltersBar({ mediaType, value, onChange, className = '' }: FiltersBarProps) {
  const { data } = useQuery({
    queryKey: ['genres', mediaType],
    queryFn: () => getGenres(mediaType),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const genres = data?.genres ?? [];
  const set = (patch: Partial<CatalogFilters>) => onChange({ ...value, ...patch });
  const clean = (v: string) => (v === ANY ? '' : v);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most popular' },
    { value: 'vote_average.desc', label: 'Top rated' },
    {
      value: mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc',
      label: 'Newest',
    },
  ];

  const triggerClass = 'h-9 rounded-full bg-secondary/60 border-0 text-sm w-auto min-w-[7.5rem] gap-1';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Select value={value.genre || ANY} onValueChange={v => set({ genre: clean(v) })}>
        <SelectTrigger className={triggerClass} aria-label="Filter by genre">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl max-h-72">
          <SelectItem value={ANY} className="rounded-xl">All genres</SelectItem>
          {genres.map(g => (
            <SelectItem key={g.id} value={String(g.id)} className="rounded-xl">{g.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.year || ANY} onValueChange={v => set({ year: clean(v) })}>
        <SelectTrigger className={triggerClass} aria-label="Filter by year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl max-h-72">
          <SelectItem value={ANY} className="rounded-xl">Any year</SelectItem>
          {YEARS.map(y => (
            <SelectItem key={y} value={y} className="rounded-xl">{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.minRating || ANY} onValueChange={v => set({ minRating: clean(v) })}>
        <SelectTrigger className={triggerClass} aria-label="Filter by minimum rating">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          <SelectItem value={ANY} className="rounded-xl">Any rating</SelectItem>
          {RATINGS.map(r => (
            <SelectItem key={r} value={r} className="rounded-xl">{r}+ rating</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.sort} onValueChange={v => set({ sort: v })}>
        <SelectTrigger className={triggerClass} aria-label="Sort results">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {sortOptions.map(o => (
            <SelectItem key={o.value} value={o.value} className="rounded-xl">{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters(value) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-full gap-1 text-muted-foreground"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
