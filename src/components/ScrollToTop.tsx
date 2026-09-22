import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType, type Location } from 'react-router-dom';

/**
 * Resets scroll position when the user navigates to a new page.
 *
 * Deliberately does nothing when:
 *  - a title modal is opening/closing over a background page (the list behind
 *    must keep its scroll position), or
 *  - the navigation is a back/forward POP (the browser restores scroll itself).
 */
export function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();
  const lastPath = useRef(location.pathname);

  const isOverlay = Boolean((location.state as { background?: Location } | null)?.background);

  useEffect(() => {
    const changed = lastPath.current !== location.pathname;
    lastPath.current = location.pathname;

    if (isOverlay || navType === 'POP' || !changed) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, navType, isOverlay]);

  return null;
}
