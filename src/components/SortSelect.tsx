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
  { value: 'release_date', label: 'Release Date' },
  { value: 'title', label: 'Title' },
];

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("rounded-full bg-secondary/40 border-0", className)}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-xl">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
