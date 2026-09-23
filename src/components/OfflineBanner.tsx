import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/** Slim banner shown while the browser reports no network connection. */
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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground"
    >
      <WifiOff className="h-3.5 w-3.5" />
      You're offline — showing saved titles
    </div>
  );
}
