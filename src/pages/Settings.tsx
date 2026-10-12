import { Download, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm';
import { ClearLocalDataDialog } from '@/components/account/ClearLocalDataDialog';
import { DeleteAccountDialog } from '@/components/account/DeleteAccountDialog';
import { downloadJson, exportFilename } from '@/components/account/exportData';
import { Layout } from '@/components/Layout';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { useHidden } from '@/hooks/useHidden';
import { useWatchlist } from '@/hooks/useWatchlist';
import { cn } from '@/lib/utils';

function Section({ id, title, description, tone, children }: { id: string; title: string; description?: string; tone?: 'danger'; children: React.ReactNode }) {
  return (
    <Card id={id} className={cn('scroll-mt-24', tone === 'danger' && 'border-destructive/40')}>
      <CardHeader>
        <h2 className="text-xl">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { watchlist } = useWatchlist();
  const { items: hidden } = useHidden();
  const { items: episodes } = useEpisodeProgress();

  const exportData = () => {
    downloadJson(exportFilename(), {
      app: 'Reel',
      exportedAt: new Date().toISOString(),
      account: user?.email ?? null,
      watchlist,
      hiddenTitles: hidden,
      episodeProgress: episodes,
    });
    toast.success('Your data was exported');
  };

  const sections = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'account', label: 'Account' },
    { id: 'data', label: 'Your data' },
    ...(user ? [{ id: 'delete', label: 'Delete account' }] : []),
  ];

  return (
    <Layout>
      <Seo title="Settings — Reel" description="Appearance, account and data settings for Reel." path="/settings" noindex />
      <PageHeader eyebrow="Account" title="Settings" description="How Reel looks, your account, and the data you keep with it." />

      <PageContainer className="pb-6">
        <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,40rem)] lg:gap-16">
          <nav aria-label="Settings sections" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <ul className="space-y-1.5 text-sm">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-6">
            <Section id="appearance" title="Appearance" description="Reel opens in its dark theme. System follows your device.">
              <ThemeSwitcher />
            </Section>

            <Section id="account" title="Account">
              {user ? (
                <>
                  <dl>
                    <dt className="label-mono">Signed in as</dt>
                    <dd className="mt-1 break-all font-mono text-sm">{user.email}</dd>
                  </dl>
                  <div className="space-y-3 border-t border-border pt-5">
                    <h3 className="text-base">Change password</h3>
                    <ChangePasswordForm />
                  </div>
                  <div className="border-t border-border pt-5">
                    <Button variant="outline" onClick={() => void signOut()}>
                      <LogOut /> Sign out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Callout title="You're using Reel as a guest">
                    Your list, ratings and episode progress are saved in this browser only. Create an account to keep them safe and use them on every device.
                  </Callout>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link to="/auth?tab=signup">Create account</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/auth">Sign in</Link>
                    </Button>
                  </div>
                </>
              )}
            </Section>

            <Section
              id="data"
              title="Your data"
              description={user ? 'Everything saved with your account.' : 'Everything saved in this browser.'}
            >
              <p className="numeral font-mono text-sm text-muted-foreground">
                {watchlist.length} in your list · {hidden.length} hidden · {episodes.length} episodes watched
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={exportData}>
                  <Download /> Export my data
                </Button>
                {!user && <ClearLocalDataDialog />}
              </div>
              <p className="text-[0.8125rem] text-muted-foreground">
                The export is a JSON file with your list, ratings, watched dates, episode progress and hidden titles.
              </p>
            </Section>

            {user && (
              <Section
                id="delete"
                tone="danger"
                title="Delete account"
                description="Permanently removes your account and everything saved with it. This can't be undone."
              >
                <DeleteAccountDialog />
              </Section>
            )}
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
}
