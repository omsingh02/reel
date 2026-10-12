import { Component, type ReactNode } from 'react';
import { Art } from '@/components/reel/art';
import { Button } from '@/components/ui/button';

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * Last line of defence: a render crash anywhere below shows a recoverable
 * screen instead of a blank page.
 *
 * Special case: a failed lazy chunk means the user is running an old build
 * whose files no longer exist on the server (happens right after a deploy).
 * That is recoverable by reloading once; we guard with sessionStorage so a
 * genuinely broken build cannot become a reload loop.
 */
const RELOAD_FLAG = 'reel:chunk-reload';

function isStaleChunkError(error: Error) {
  return /dynamically imported module|Importing a module script failed|Loading chunk/i.test(
    `${error.name} ${error.message}`
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (isStaleChunkError(error) && sessionStorage.getItem(RELOAD_FLAG) !== '1') {
      try { sessionStorage.setItem(RELOAD_FLAG, '1'); } catch { /* private mode */ }
      window.location.reload();
      return;
    }
    console.error('[Reel] render crash', error);
  }

  private reset = () => {
    try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* private mode */ }
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    // This can render outside the router and the theme provider, so it uses plain tokens only.
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-16 text-foreground">
        <div className="flex max-w-md flex-col items-center text-center">
          <Art name="error" className="mb-6" />
          <p className="label-mono">Something went wrong</p>
          <h1 className="mt-2 text-display-sm text-balance">That page hit a snag</h1>
          <p className="mt-3 text-muted-foreground text-pretty">
            Nothing you saved was lost. Try again, or head back to Discover.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={this.reset}>Try again</Button>
            <Button variant="outline" onClick={() => { window.location.href = '/'; }}>
              Back to Discover
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
