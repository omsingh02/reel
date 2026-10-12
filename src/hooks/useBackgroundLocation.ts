import { useLocation, type Location } from 'react-router-dom';

/**
 * Title pages open as a modal over whatever page you were on. For "where am I" decisions
 * (active nav item, whether to show the search field) use the page underneath, not the modal route.
 */
export function useBackgroundLocation(): Location {
  const location = useLocation();
  const state = location.state as { background?: Location } | null;
  return state?.background ?? location;
}
