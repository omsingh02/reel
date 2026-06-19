import { Tv } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';

export default function TVShows() {
  return (
    <MediaListPage
      title="TV Shows"
      fixedMediaType="tv"
      source="popular"
      emptyIcon={Tv}
      searchPlaceholder="Search TV shows..."
      defaultSubtitle="Popular TV shows right now"
    />
  );
}
