import { Tv } from 'lucide-react';
import { MediaListPage } from '@/components/MediaListPage';
import { Seo } from '@/components/Seo';
import { SITE_URL } from '@/lib/site';

export default function TVShows() {
  return (
    <>
      <Seo
        title="TV Shows — browse by genre, year and rating | Reel"
        description="Browse TV series by genre, year and rating. Filter, sort and track episodes you have watched."
        path="/shows"
        jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "TV Shows", url: `${SITE_URL}/shows`, about: "TV series to discover and track" }}
      />
      <MediaListPage
        title="TV Shows"
        mediaType="tv"
        emptyIcon={Tv}
        subtitle="Browse by genre, year and rating"
      />
    </>
  );
}
