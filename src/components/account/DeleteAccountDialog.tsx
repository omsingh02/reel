import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { clearHidden } from '@/lib/hidden';
import { clearProgress } from '@/lib/progress';
import { clearWatchlist } from '@/lib/watchlist';

const CONFIRM_WORD = 'DELETE';

/** Pulls the message out of a failed edge function call, falling back to something readable. */
async function messageFrom(error: unknown): Promise<string> {
  const fallback = "We couldn't delete your account. Please try again.";
  const context = (error as { context?: Response } | null)?.context;
  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json();
      if (typeof body?.error === 'string') return body.error;
    } catch { /* not JSON */ }
  }
  return fallback;
}

/** "Delete account": spells out what goes, asks for the word DELETE, then calls the delete-account function. */
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onOpenChange = (next: boolean) => {
    if (busy) return;
    setOpen(next);
    if (!next) { setTyped(''); setError(null); }
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
    } catch (e) {
      setError(await messageFrom(e));
      setBusy(false);
      return;
    }

    // The account is gone: drop the session and everything this browser still holds for it.
    await signOut().catch(() => undefined);
    clearWatchlist();
    clearHidden();
    clearProgress();
    ['watchlist', 'hidden_items', 'episode_progress'].forEach(key => queryClient.removeQueries({ queryKey: [key] }));
    setBusy(false);
    setOpen(false);
    navigate('/', { replace: true });
    toast.success('Your account has been deleted');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your Reel account and everything saved with it: your list, ratings, watched dates,
            episode progress and hidden titles. It can't be undone. Consider exporting your data first.
          </DialogDescription>
        </DialogHeader>

        {error && <Callout tone="destructive" title={error} />}

        <form
          onSubmit={e => { e.preventDefault(); if (typed === CONFIRM_WORD && !busy) void confirm(); }}
          className="space-y-4"
        >
          <FormField id="delete-confirm" label={`Type ${CONFIRM_WORD} to confirm`}>
            {p => (
              <Input {...p} name="confirm" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={typed} onChange={e => setTyped(e.target.value)} />
            )}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={typed !== CONFIRM_WORD || busy}>
              {busy ? 'Deleting…' : 'Delete my account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
