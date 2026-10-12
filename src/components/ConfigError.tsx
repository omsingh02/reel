import { AlertTriangle } from 'lucide-react';

interface ConfigErrorProps {
  /** Names of the environment variables that are missing. */
  missing?: string[];
  /** Used when the app bundle itself failed to load. */
  loadFailed?: boolean;
}

/**
 * Shown instead of a blank white page when the app can't start. It deliberately imports
 * nothing that touches Supabase: the generated client throws at import time when its
 * environment variables are missing, which is exactly the situation this screen explains.
 */
export function ConfigError({ missing = [], loadFailed = false }: ConfigErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        {loadFailed ? (
          <>
            <h1 className="text-xl font-semibold">Reel couldn't start</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The app failed to load. Check your connection and reload the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Reload
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Reel isn't configured yet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              These environment variables are missing, so the app can't reach its backend:
            </p>
            <ul className="mt-3 space-y-1 font-mono text-xs">
              {missing.map(name => (
                <li key={name} className="rounded-md bg-secondary px-2 py-1">{name}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Copy <code>.env.example</code> to <code>.env</code>, fill in your Supabase values, and restart the
              dev server (or set them in your host's build settings and redeploy).
            </p>
          </>
        )}
      </div>
    </main>
  );
}
