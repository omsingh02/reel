import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { PasswordInput } from '@/components/account/PasswordInput';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { FormField } from '@/components/ui/form-field';
import { supabase } from '@/integrations/supabase/client';

const passwordSchema = z.string().min(6, { message: 'Use at least 6 characters' }).max(72, { message: 'Use 72 characters or fewer' });

/** Change the password of the signed-in account. */
export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = passwordSchema.safeParse(password);
    const next: typeof errors = {};
    if (!parsed.success) next.password = parsed.error.errors[0].message;
    if (confirm !== password) next.confirm = 'The two passwords do not match';
    setErrors(next);
    if (next.password || next.confirm) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setConfirm('');
      toast.success('Password updated');
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We couldn't update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label="Change password">
      {formError && <Callout tone="destructive" title={formError} />}
      <FormField id="settings-new-password" label="New password" hint="At least 6 characters." error={errors.password}>
        {p => <PasswordInput {...p} name="new-password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />}
      </FormField>
      <FormField id="settings-confirm-password" label="Confirm new password" error={errors.confirm}>
        {p => <PasswordInput {...p} name="confirm-password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />}
      </FormField>
      <Button type="submit" variant="secondary" disabled={busy || (!password && !confirm)}>
        {busy ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
