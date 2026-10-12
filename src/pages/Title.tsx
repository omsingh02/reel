import { useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MediaDetails } from '@/components/MediaDetails';
import { Layout } from '@/components/Layout';
import { EmptyState } from '@/components/EmptyState';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { titlePath } from '@/lib/tmdb';
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
        <div className="flex flex-1 items-center justify-center px-6">
          <EmptyState art="search" title="Title not found" description="That link doesn't point to a valid title.">
            <Button onClick={() => navigate('/')}>Back to Discover</Button>
          </EmptyState>
        </div>
      </Layout>
    );
  }

  // Over another page: a dialog. Opened directly (or shared): the same content as a normal page.
  if (overlay) {
    return <MediaDetails id={numericId} mediaType={mediaType} onClose={close} onNavigate={goTo} overlay />;
  }

  return (
    <Layout>
      <MediaDetails id={numericId} mediaType={mediaType} onClose={close} onNavigate={goTo} />
    </Layout>
  );
}
