/**
 * Loads the YouTube IFrame API once, however many players ask for it.
 *
 * Rejects if the script is blocked (ad blockers, offline, corporate proxies) or never
 * calls back, so callers can show a fallback instead of spinning forever. A failed
 * attempt isn't cached, so a later retry can succeed.
 */
let pending: Promise<void> | null = null;

export function loadYouTubeApi(timeoutMs = 10_000): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.YT?.Player) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const tag = document.createElement('script');

    const fail = (reason: string) => {
      clearTimeout(timer);
      window.onYouTubeIframeAPIReady = previous;
      tag.remove();
      pending = null;
      reject(new Error(reason));
    };
    const timer = setTimeout(() => fail('YouTube API timed out'), timeoutMs);

    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      if (typeof previous === 'function') previous();
      resolve();
    };
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => fail('YouTube API failed to load');
    document.head.appendChild(tag);
  });
  return pending;
}
