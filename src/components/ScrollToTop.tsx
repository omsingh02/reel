import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType, type Location } from 'react-router-dom';

/**
 * On navigating to a new page: resets scroll, and moves keyboard/screen-reader focus to the page
 * so assistive tech starts reading from the new content.
 *
 * Deliberately does nothing when:
 *  - a title modal is opening/closing over a background page (the list behind
 *    must keep its scroll position, and the dialog hands focus back to the card itself), or
 *  - the navigation is a back/forward POP (the browser restores scroll itself; focus still moves).
 */
export function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();
  const lastPath = useRef(location.pathname);
  const wasOverlay = useRef(false);

  const isOverlay = Boolean((location.state as { background?: Location } | null)?.background);

  useEffect(() => {
    const changed = lastPath.current !== location.pathname;
    const cameFromOverlay = wasOverlay.current;
    lastPath.current = location.pathname;
    wasOverlay.current = isOverlay;

    if (isOverlay || !changed) return;

    // Focus the page, unless a field already took it (the search page focuses its input on arrival)
    // or we just closed a modal (it returns focus to whatever opened it).
    if (!cameFromOverlay) {
      const active = document.activeElement as HTMLElement | null;
      const typing = !!active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
      if (!typing) document.getElementById('main')?.focus({ preventScroll: true });
    }

    if (navType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, navType, isOverlay]);

  return null;
}
