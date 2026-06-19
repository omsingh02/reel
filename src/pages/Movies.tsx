import { Film } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';

export default function Movies() {
  return (
    <MediaListPage
      title="Movies"
      fixedMediaType="movie"
      source="popular"
      emptyIcon={Film}
      searchPlaceholder="Search movies..."
      defaultSubtitle="Popular movies right now"
    />
  );
}
