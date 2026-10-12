import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { AuthShell } from '@/components/account/AuthShell';
import { PasswordInput } from '@/components/account/PasswordInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.string().trim().min(1, { message: 'Enter your email address' }).email({ message: 'That email address looks incomplete' }).max(255);
const passwordSchema = z.string().min(6, { message: 'Use at least 6 characters' }).max(72, { message: 'Use 72 characters or fewer' });

type Mode = 'signin' | 'signup';
type FieldErrors = { email?: string; password?: string };

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);

  // Same-origin relative path only: reject external URLs and protocol-relative "//host".
  const rawNext = searchParams.get('next') ?? '';
  const nextPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';
  const mode: Mode = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  const setMode = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'signup') params.set('tab', 'signup');
    else params.delete('tab');
    setSearchParams(params, { replace: true });
    setErrors({});
    setFormError(null);
    setNotice(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={nextPath} replace />;
  }

  const validate = (): { email: string; password: string } | null => {
    const e = emailSchema.safeParse(email);
    const p = passwordSchema.safeParse(password);
    const next: FieldErrors = {};
    if (!e.success) next.email = e.error.errors[0].message;
    if (!p.success) next.password = p.error.errors[0].message;
    setErrors(next);
    if (next.email) emailRef.current?.focus();
    return e.success && p.success ? { email: e.data, password: p.data } : null;
  };

  const handleSubmit = async (event: React.FormEvent, which: Mode) => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    const values = validate();
    if (!values) return;

    setBusy(true);
    try {
      if (which === 'signup') {
        const emailRedirect = window.location.origin + nextPath;
        const { error, session } = await signUp(values.email, values.password, emailRedirect);
        if (error) throw error;
        if (session) {
          // Email confirmation is off: the user is already signed in.
          toast.success('Account created');
          navigate(nextPath);
        } else {
          setNotice(`We sent a confirmation link to ${values.email}. Open it to finish creating your account.`);
          toast.success('Account created', { description: 'Check your email to confirm it.' });
        }
      } else {
        const { error } = await signIn(values.email, values.password);
        if (error) throw error;
        navigate(nextPath);
      }
    } catch (error: unknown) {
      setFormError(
        error instanceof Error && error.message
          ? error.message
          : which === 'signup' ? "We couldn't create your account. Please try again." : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    setFormError(null);
    setNotice(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrors({ email: 'Enter your email above, then choose "Forgot password?"' });
      emailRef.current?.focus();
      return;
    }
    setErrors({});

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setNotice('If an account exists for that address, a link to reset your password is on its way.');
      toast.success('Check your email', { description: 'The reset link is on its way.' });
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We couldn't send the reset email. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const messages = (
    <>
      {formError && <Callout tone="destructive" title={formError} />}
      {notice && <Callout tone="success" title={notice} />}
    </>
  );

  return (
    <AuthShell>
      <Seo
        title="Sign in to Reel"
        description="Sign in or create a free Reel account to sync your saved movies and TV shows across all of your devices."
        path="/auth"
        noindex
      />

      <div className="space-y-2">
        <p className="label-mono">Account</p>
        <h1 className="text-display-sm text-balance">{mode === 'signup' ? 'Create your Reel account' : 'Sign in to Reel'}</h1>
        <p className="text-sm text-muted-foreground">Sync your list across devices. Reel also works without an account.</p>
      </div>

      <Tabs value={mode} onValueChange={setMode} className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-5">
          <form onSubmit={e => handleSubmit(e, 'signin')} noValidate className="space-y-5">
            {messages}
            <FormField id="signin-email" label="Email" error={errors.email}>
              {p => (
                <Input
                  {...p}
                  ref={emailRef}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              )}
            </FormField>
            <FormField
              id="signin-password"
              label="Password"
              error={errors.password}
              labelAction={
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={busy}
                  className="rounded-sm text-[0.8125rem] font-medium text-primary-text underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Forgot password?
                </button>
              }
            >
              {p => (
                <PasswordInput {...p} name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
              )}
            </FormField>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-5">
          <form onSubmit={e => handleSubmit(e, 'signup')} noValidate className="space-y-5">
            {messages}
            <FormField id="signup-email" label="Email" error={errors.email}>
              {p => (
                <Input
                  {...p}
                  ref={emailRef}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              )}
            </FormField>
            <FormField id="signup-password" label="Password" hint="At least 6 characters." error={errors.password}>
              {p => (
                <PasswordInput {...p} name="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
              )}
            </FormField>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </Button>
            <p className="text-center text-[0.8125rem] text-muted-foreground">
              By creating an account you agree to the <Link to="/terms" className="font-medium text-foreground underline underline-offset-4">Terms</Link> and{' '}
              <Link to="/privacy" className="font-medium text-foreground underline underline-offset-4">Privacy notice</Link>.
            </p>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Continue as a guest</Link>
        </Button>
        <p className="mt-1 text-[0.8125rem] text-subtle">Guest lists stay on this device.</p>
      </div>
    </AuthShell>
  );
}
