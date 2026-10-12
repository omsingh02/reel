import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Film, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";

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

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id.");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      if (!oauth?.getAuthorizationDetails) {
        return setError("OAuth is not available in this client build.");
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
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Seo
        title="Authorize App Access — Reel"
        description="Review and approve the access an external app is requesting to your Reel account."
        path="/oauth/consent"
        noindex
      />
        <div className="w-full max-w-md rounded-3xl bg-card shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Authorization error</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "an app";
  const redirectUri = details.client?.redirect_uri ?? details.redirect_uri ?? null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
    <Seo
      title="Authorize App Access — Reel"
      description="Review and approve the access an external app is requesting to your Reel account."
      path="/oauth/consent"
      noindex
    />
      <div className="w-full max-w-md rounded-3xl bg-card shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Film className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Connect {clientName} to Reel</h1>
          <p className="text-sm text-muted-foreground mt-2">
            This lets <span className="font-medium">{clientName}</span> use this app as you.
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/40 p-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="font-medium">Access to your Reel list</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Search titles and read, add, remove, or update your watchlist items and ratings.
              </p>
            </div>
          </div>
          {redirectUri && (
            <p className="text-xs text-muted-foreground break-all">
              Redirect: <span className="font-mono">{redirectUri}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            This does not bypass Reel's permissions. Only approve apps you trust.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-full"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1 h-11 rounded-full" disabled={busy} onClick={() => decide(true)}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
