import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * A slim warning strip under the top bar while the browser reports no connection.
 * It floats (fixed, below the sticky header) so it does not shift the page when it appears.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[var(--topbar-h)] z-30 flex items-center justify-center gap-2 border-b border-warning/35 bg-warning-subtle px-4 py-1.5 text-center text-[0.8125rem] font-medium text-warning-text"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
      You're offline. Showing saved content where possible.
    </div>
  );
}
