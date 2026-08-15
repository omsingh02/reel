import { useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MediaDetails } from '@/components/MediaDetails';
import { Layout } from '@/components/Layout';
import { EmptyState } from '@/components/EmptyState';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { titlePath } from '@/lib/tmdb';
import { AlertTriangle } from 'lucide-react';
import type { MediaType } from '@/types/tmdb';

interface TitleRouteProps {
  /** true when rendered over a background page (modal), false for direct visits. */
  overlay?: boolean;
  mediaType: MediaType;
}

export default function TitleRoute({ overlay = false, mediaType }: TitleRouteProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const numericId = Number.parseInt(id ?? '', 10);
  const valid = Number.isFinite(numericId) && numericId > 0;

  const close = useCallback(() => {
    const state = location.state as { background?: { pathname?: string } } | null;
    if (state?.background) navigate(-1);
    else navigate(mediaType === 'movie' ? '/movies' : '/shows');
  }, [navigate, location.state, mediaType]);

  const goTo = useCallback(
    (nextId: number, nextType: MediaType) => {
      navigate(titlePath(nextId, nextType), {
        replace: true,
        state: location.state,
      });
    },
    [navigate, location.state]
  );

  if (!valid) {
    return (
      <Layout>
        <Seo title="Title not found — Reel" description="This title could not be found." path={location.pathname} noindex />
        <div className="flex-1 flex items-center justify-center px-6">
          <EmptyState icon={AlertTriangle} title="Title not found" description="That link doesn't point to a valid title.">
            <Button className="rounded-full" onClick={() => navigate('/')}>Back to Discover</Button>
          </EmptyState>
        </div>
      </Layout>
    );
  }

  const modal = (
    <MediaDetails id={numericId} mediaType={mediaType} onClose={close} onNavigate={goTo} />
  );

  if (overlay) return modal;

  return (
    <Layout>
      <Seo
        title={`${mediaType === 'movie' ? 'Movie' : 'Show'} details — Reel`}
        description="Cast, ratings, trailers, streaming providers and episode tracking."
        path={location.pathname}
      />
      <div className="flex-1" />
      {modal}
    </Layout>
  );
}
