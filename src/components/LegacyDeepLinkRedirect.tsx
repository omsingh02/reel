import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { titlePath } from '@/lib/tmdb';

/**
 * Keeps old shared links working: /?movie=123 and /?tv=456 now redirect to
 * the canonical /movie/123 and /show/456 routes.
 */
export function LegacyDeepLinkRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('movie') ?? params.get('tv');
    if (!raw) return;
    const type = params.get('movie') ? 'movie' : 'tv';
    const id = Number.parseInt(raw, 10);
    params.delete('movie');
    params.delete('tv');
    if (!Number.isFinite(id) || id <= 0) {
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      return;
    }
    navigate(titlePath(id, type), {
      replace: true,
      state: { background: { ...location, search: params.toString(), state: null } },
    });
  }, [location, navigate]);

  return null;
}
