import { Search } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';

export default function Index() {
  return (
    <MediaListPage
      title="Trending"
      source="trending"
      emptyIcon={Search}
      defaultSubtitle="Trending right now"
      enableDeepLinks
    />
  );
}
