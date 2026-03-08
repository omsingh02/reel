import { Share2, Link, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  mediaType: 'movie' | 'tv';
  id: number;
}

export function ShareButton({ title, mediaType, id }: ShareButtonProps) {
  const shareUrl = `${window.location.origin}?${mediaType}=${id}`;
  const shareText = `Check out "${title}" on Watchlist`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      copyLink();
    }
  };

  // Use native share on mobile
  if (navigator.share) {
    return (
      <Button variant="outline" size="icon" className="rounded-full" onClick={nativeShare}>
        <Share2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl">
        <DropdownMenuItem onClick={copyLink} className="rounded-xl">
          <Link className="h-4 w-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareTwitter} className="rounded-xl">
          <Twitter className="h-4 w-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook} className="rounded-xl">
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
