import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { FocusedLayout } from '@/components/account/FocusedLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo } from '@/components/Logo';
import { Art } from '@/components/reel';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Beta typed wrapper for supabase.auth.oauth (not yet in generated types).
interface AuthorizationDetails {
  client?: { name?: string; redirect_uri?: string };
  redirect_uri?: string;
  redirect_url?: string;
  redirect_to?: string;
}
type OAuthResult = Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
type OAuthApi = {
  getAuthorizationDetails: (id: string) => OAuthResult;
  approveAuthorization: (id: string) => OAuthResult;
  denyAuthorization: (id: string) => OAuthResult;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

/** What a connected assistant can do through Reel's tools. */
const CAPABILITIES = [
  'Search movies and TV shows',
  'Read your list: statuses and ratings',
  'Add titles to your list and mark them watched',
  'Change your ratings and remove titles',
];

const seo = (
  <Seo
    title="Authorize app access — Reel"
    description="Review and approve the access an external app is requesting to your Reel account."
    path="/oauth/consent"
    noindex
  />
);

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const authorizationId = params.get('authorization_id') ?? '';
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'approve' | 'deny' | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError('Missing authorization_id.');
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = '/auth?next=' + encodeURIComponent(next);
        return;
      }
      if (!oauth?.getAuthorizationDetails) {
        return setError('OAuth is not available in this client build.');
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(approve ? 'approve' : 'deny');
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(null);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(null);
      return setError('No redirect returned by the authorization server.');
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <FocusedLayout>
        {seo}
        <div className="flex flex-col items-center py-8 text-center">
          <Art name="error" className="mb-5" />
          <h1 className="text-display-sm text-balance">We couldn't open this request</h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground" role="alert">{error}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Go back to the app that sent you here and try connecting again.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Back to Reel</Link>
          </Button>
        </div>
      </FocusedLayout>
    );
  }

  if (!details) {
    return (
      <FocusedLayout>
        {seo}
        <h1 className="sr-only">Authorize app access</h1>
        <LoadingSpinner size="lg" label="Loading the request" />
      </FocusedLayout>
    );
  }

  const clientName = details.client?.name ?? 'an app';
  const redirectUri = details.client?.redirect_uri ?? details.redirect_uri ?? null;

  return (
    <FocusedLayout>
      {seo}

      <div className="flex items-center justify-center gap-3" aria-hidden>
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface-2 font-display text-2xl font-semibold uppercase">
          {clientName.charAt(0)}
        </div>
        <div className="flex items-center gap-1 text-subtle">
          <span className="h-px w-8 border-t border-dashed border-border-strong" />
          <ArrowRight className="h-4 w-4" />
          <span className="h-px w-8 border-t border-dashed border-border-strong" />
        </div>
        <Logo className="h-14 w-14" />
      </div>

      <div className="mt-8 text-center">
        <p className="label-mono">Connect an app</p>
        <h1 className="mt-2 text-display-sm text-balance">
          Connect <span className="break-words">{clientName}</span> to Reel
        </h1>
        {user?.email && (
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as <span className="font-semibold text-foreground">{user.email}</span>. It will act as you.
          </p>
        )}
      </div>

      <section aria-labelledby="can-do" className="mt-8 rounded-lg border border-border bg-card p-5 shadow-panel">
        <h2 id="can-do" className="label-mono mb-3">It will be able to</h2>
        <ul className="space-y-2.5">
          {CAPABILITIES.map(item => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-text" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Callout tone="warning" className="mt-4" title="Only approve apps you trust">
        Approving lets {clientName} use Reel on your behalf.
      </Callout>

      {redirectUri && (
        <p className="mt-4 break-all text-center text-[0.8125rem] text-subtle">
          After you choose, you'll be sent to <span className="font-mono">{redirectUri}</span>
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" disabled={busy !== null} onClick={() => decide(false)}>
          {busy === 'deny' ? 'Cancelling…' : 'Cancel'}
        </Button>
        <Button size="lg" disabled={busy !== null} onClick={() => decide(true)}>
          {busy === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
      </div>
    </FocusedLayout>
  );
}
