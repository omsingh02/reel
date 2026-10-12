import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SortOption = 'popularity' | 'rating' | 'release_date' | 'title';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Release date' },
  { value: 'title', label: 'Title' },
];

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={v => onChange(v as SortOption)}>
      <SelectTrigger className={cn('w-44', className)} aria-label="Sort by">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
