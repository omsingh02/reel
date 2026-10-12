import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { clearHidden } from '@/lib/hidden';
import { clearProgress } from '@/lib/progress';
import { clearWatchlist } from '@/lib/watchlist';

/** For guests: remove the list, hidden titles and episode progress stored in this browser. */
export function ClearLocalDataDialog() {
  const [open, setOpen] = useState(false);

  const clear = () => {
    clearWatchlist();
    clearHidden();
    clearProgress();
    setOpen(false);
    toast.success('Data on this device cleared');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Clear data on this device</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Clear data on this device?</DialogTitle>
          <DialogDescription>
            This removes your list, ratings, watched episodes and hidden titles from this browser. Without an account there is no copy anywhere else, so export first if you want to keep it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={clear}>Clear data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
