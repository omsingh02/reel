import { Art } from '@/components/reel/art';
import { Button } from '@/components/ui/button';

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
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Art name={loadFailed ? 'offline' : 'error'} className="mb-6" />
        {loadFailed ? (
          <>
            <h1 className="text-display-sm text-balance">Reel couldn't start</h1>
            <p className="mt-3 text-muted-foreground">The app failed to load. Check your connection and reload the page.</p>
            <Button className="mt-7" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </>
        ) : (
          <>
            <p className="label-mono">Setup needed</p>
            <h1 className="mt-2 text-display-sm text-balance">Reel isn't configured yet</h1>
            <p className="mt-3 text-muted-foreground">
              These environment variables are missing, so the app can't reach its backend:
            </p>
            <ul className="mt-4 w-full space-y-1.5 font-mono text-sm">
              {missing.map(name => (
                <li key={name} className="rounded-md border border-border bg-card px-3 py-2">{name}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              Copy <code className="rounded-sm bg-surface-2 px-1 py-0.5 font-mono text-[0.8125rem]">.env.example</code> to{' '}
              <code className="rounded-sm bg-surface-2 px-1 py-0.5 font-mono text-[0.8125rem]">.env</code>, fill in your Supabase values, and restart the
              dev server (or set them in your host's build settings and redeploy).
            </p>
          </>
        )}
      </div>
    </main>
  );
}
