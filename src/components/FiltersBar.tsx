import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { getGenres } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
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
const YEARS = Array.from({ length: CURRENT_YEAR - 1930 + 1 }, (_, i) => String(CURRENT_YEAR - i));
const RATINGS = ['9', '8', '7', '6', '5'];

interface FiltersBarProps {
  mediaType: MediaType;
  value: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  className?: string;
}

/**
 * Genre, year, minimum rating and sort, as a quiet toolbar of selects. Two columns on phones,
 * a single row from `sm` up. A "Clear" action appears only when something is filtered.
 */
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

  const trigger = 'sm:w-44';

  return (
    <div role="group" aria-label="Filters" className={cn('grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center', className)}>
      <Select value={value.genre || ANY} onValueChange={v => set({ genre: clean(v) })}>
        <SelectTrigger className={trigger} aria-label="Filter by genre">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>All genres</SelectItem>
          {genres.map(g => (
            <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.year || ANY} onValueChange={v => set({ year: clean(v) })}>
        <SelectTrigger className={trigger} aria-label="Filter by year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any year</SelectItem>
          {YEARS.map(y => (
            <SelectItem key={y} value={y} className="numeral">{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.minRating || ANY} onValueChange={v => set({ minRating: clean(v) })}>
        <SelectTrigger className={trigger} aria-label="Filter by minimum rating">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any rating</SelectItem>
          {RATINGS.map(r => (
            <SelectItem key={r} value={r}>{r}+ rating</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.sort} onValueChange={v => set({ sort: v })}>
        <SelectTrigger className={trigger} aria-label="Sort results">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters(value) && (
        <Button variant="ghost" onClick={() => onChange(DEFAULT_FILTERS)} className="col-span-2 sm:col-auto">
          <X />
          Clear
        </Button>
      )}
    </div>
  );
}
