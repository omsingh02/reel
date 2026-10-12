import { Film } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';
import { Seo } from '@/components/Seo';
import { SITE_URL } from '@/lib/site';

export default function Movies() {
  return (
    <>
      <Seo
        title="Movies — browse by genre, year and rating | Reel"
        description="Browse movies by genre, year and rating. Filter, sort and save picks to your list."
        path="/movies"
        jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Movies", url: `${SITE_URL}/movies`, about: "Movies to discover and track" }}
      />
      <MediaListPage
        title="Movies"
        mediaType="movie"
        emptyIcon={Film}
        subtitle="Browse by genre, year and rating"
      />
    </>
  );
}
