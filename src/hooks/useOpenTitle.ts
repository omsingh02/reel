import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { titlePath } from '@/lib/tmdb';
import type { MediaType } from '@/types/tmdb';

/**
 * Opens a title at its own URL (/movie/:id, /show/:id) while keeping the
 * current page rendered behind the modal. Direct visits to those URLs render
 * the standalone title page instead.
 */
export function useOpenTitle() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (id: number, type: MediaType) => {
      const state = location.state as { background?: unknown } | null;
      const background = state?.background ?? location;
      navigate(titlePath(id, type), { state: { background } });
    },
    [navigate, location]
  );
}
