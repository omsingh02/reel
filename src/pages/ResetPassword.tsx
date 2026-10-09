import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Seo } from '@/components/Seo';

const passwordSchema = z
  .object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(72),
    confirm: z.string(),
  })
  .refine(v => v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });

// How long to wait for the recovery link to produce a session before giving up.
const RECOVERY_WAIT_MS = 3000;

type Phase = 'checking' | 'ready' | 'expired';

export default function ResetPassword() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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

    const result = passwordSchema.safeParse({ password, confirm });
    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: result.error.errors[0].message,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'You are signed in with your new password.' });
      navigate('/', { replace: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't update password",
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "h-12 w-full rounded-xl bg-secondary/50 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Seo
        title="Reset password — Reel"
        description="Choose a new password for your Reel account."
        path="/reset-password"
        noindex
      />
      <div className="w-full max-w-md rounded-3xl bg-card shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Film className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Choose a new password</h1>
        </div>

        {phase === 'checking' && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {phase === 'expired' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired. Request a new one from the sign-in page.
            </p>
            <Button asChild className="w-full h-12 rounded-full text-sm font-medium">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </div>
        )}

        {phase === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pl-12 pr-12`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${inputClasses} pl-12`}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-full text-sm font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
