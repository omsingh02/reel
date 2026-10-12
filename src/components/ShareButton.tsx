import { Share2, Link, Twitter, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { titlePath } from '@/lib/tmdb';

interface ShareButtonProps {
  title: string;
  mediaType: 'movie' | 'tv';
  id: number;
}

export function ShareButton({ title, mediaType, id }: ShareButtonProps) {
  const shareUrl = `${window.location.origin}${titlePath(id, mediaType)}`;
  const shareText = `Check out "${title}" on Reel`;

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

  // Phones and some desktops have a native share sheet; use it when it exists.
  if (navigator.share) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary" size="icon-lg" aria-label="Share" onClick={nativeShare}>
            <Share2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon-lg" aria-label="Share">
              <Share2 />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={copyLink}>
          <Link /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={shareTwitter}>
          <Twitter /> Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={shareFacebook}>
          <Facebook /> Share on Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
