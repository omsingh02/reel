import { Tv } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';
import { Seo } from '@/components/Seo';

export default function TVShows() {
  return (
    <>
      <Seo
        title="Popular TV Shows — Watchlist"
        description="Browse popular and trending TV series, search by title, sort by rating or air date, and track episodes you have watched."
        path="/tv"
        jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Popular TV Shows", url: "https://wat.lovable.app/tv", about: "Popular TV series to discover and track" }}
      />
      <MediaListPage
        title="TV Shows"
        fixedMediaType="tv"
        source="popular"
        emptyIcon={Tv}
        searchPlaceholder="Search TV shows..."
        defaultSubtitle="Popular TV shows right now"
      />
    </>
  );
}
