import { Clapperboard, Tv } from 'lucide-react';
import { Segmented } from '@/components/ui/segmented';
import type { MediaType } from '@/types/tmdb';

interface MediaTypeFilterProps {
  value: MediaType;
  onChange: (type: MediaType) => void;
  className?: string;
}

/** Movies / TV Shows switch. */
export function MediaTypeFilter({ value, onChange, className }: MediaTypeFilterProps) {
  return (
    <Segmented<MediaType>
      aria-label="Media type"
      value={value}
      onValueChange={onChange}
      className={className}
      options={[
        { value: 'movie', label: 'Movies', icon: <Clapperboard /> },
        { value: 'tv', label: 'TV Shows', icon: <Tv /> },
      ]}
    />
  );
}
