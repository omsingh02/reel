import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/**
 * Last line of defence: a render crash anywhere below shows a recoverable
 * screen instead of a blank page.
 *
 * Special case — a failed lazy chunk means the user is running an old build
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

    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <EmptyState
          icon={AlertTriangle}
          title="Something broke"
          description="That page hit an unexpected error. Nothing you saved was lost."
        >
          <div className="flex gap-2">
            <Button className="rounded-full" onClick={this.reset}>Try again</Button>
            <Button variant="outline" className="rounded-full" onClick={() => { window.location.href = '/'; }}>
              Back to Discover
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }
}
