import { Film } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';
import { Seo } from '@/components/Seo';

export default function Movies() {
  return (
    <>
      <Seo
        title="Popular Movies — Watchlist"
        description="Browse popular and trending movies, search by title, sort by rating or release date, and save picks to your watchlist."
        path="/movies"
        jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Popular Movies", url: "https://wat.lovable.app/movies", about: "Popular movies to discover and track" }}
      />
      <MediaListPage
        title="Movies"
        fixedMediaType="movie"
        source="popular"
        emptyIcon={Film}
        searchPlaceholder="Search movies..."
        defaultSubtitle="Popular movies right now"
      />
    </>
  );
}
