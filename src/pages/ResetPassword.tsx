import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { AuthShell } from '@/components/account/AuthShell';
import { PasswordInput } from '@/components/account/PasswordInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/integrations/supabase/client';

const passwordSchema = z.string().min(6, { message: 'Use at least 6 characters' }).max(72, { message: 'Use 72 characters or fewer' });

// How long to wait for the recovery link to produce a session before giving up.
const RECOVERY_WAIT_MS = 3000;

type Phase = 'checking' | 'ready' | 'expired';
type FieldErrors = { password?: string; confirm?: string };

export default function ResetPassword() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setPhase('ready');
    });

    // The recovery event may have fired before we subscribed; an existing session is enough.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) setPhase('ready');
    });

    const timer = setTimeout(() => {
      if (active) setPhase(p => (p === 'checking' ? 'expired' : p));
    }, RECOVERY_WAIT_MS);

    return () => {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = passwordSchema.safeParse(password);
    const next: FieldErrors = {};
    if (!parsed.success) next.password = parsed.error.errors[0].message;
    if (confirm !== password) next.confirm = 'The two passwords do not match';
    setErrors(next);
    if (next.password || next.confirm) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated', { description: 'You are signed in with your new password.' });
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We couldn't update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <Seo title="Reset password — Reel" description="Choose a new password for your Reel account." path="/reset-password" noindex />

      <div className="space-y-2">
        <p className="label-mono">Account</p>
        <h1 className="text-display-sm text-balance">Choose a new password</h1>
      </div>

      <div className="mt-8">
        {phase === 'checking' && (
          <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <LoadingSpinner size="sm" label="Checking your reset link" />
            Checking your reset link…
          </div>
        )}

        {phase === 'expired' && (
          <div className="space-y-5">
            <Callout tone="warning" title="This reset link has expired or was already used">
              Links work once and for a short time. Request a new one from the sign-in page.
            </Callout>
            <Button asChild size="lg" className="w-full">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </div>
        )}

        {phase === 'ready' && (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {formError && <Callout tone="destructive" title={formError} />}
            <FormField id="new-password" label="New password" hint="At least 6 characters." error={errors.password}>
              {p => <PasswordInput {...p} name="new-password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />}
            </FormField>
            <FormField id="confirm-password" label="Confirm new password" error={errors.confirm}>
              {p => <PasswordInput {...p} name="confirm-password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />}
            </FormField>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
