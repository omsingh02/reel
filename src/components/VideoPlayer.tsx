import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';
import { loadYouTubeApi } from '@/lib/youtube';

interface VideoPlayerProps {
  videoKey: string;
  title?: string;
  onClose: () => void;
}

export function VideoPlayer({ videoKey, title, onClose }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerNodeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const playerId = `yt-player-${useId().replace(/:/g, '')}`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { containerRef.current?.focus(); }, []);
  const hideControlsTimeout = useRef<number | null>(null);

  // Mutable refs so keyboard handlers always see fresh values
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isMutedRef = useRef(false);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Load the YouTube IFrame API (once, shared) and create the player.
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setIsReady(false);

    loadYouTubeApi()
      .then(() => {
        if (cancelled || !playerNodeRef.current) return;
        playerRef.current = new YT.Player(playerNodeRef.current, {
          videoId: videoKey,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 0,
            playsinline: 1,
            disablekb: 1,
            cc_load_policy: 0,
            origin: window.location.origin,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: YT.PlayerEvent) => {
              setIsReady(true);
              setDuration(event.target.getDuration());
              setIsPlaying(true);
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              setIsPlaying(event.data === YT.PlayerState.PLAYING);
            },
            // Removed, private, or embedding disabled by the owner (errors 2, 5, 100, 101, 150).
            onError: () => setFailed(true),
          },
        });
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      try { playerRef.current?.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    };
  }, [videoKey]);

  // Update progress
  useEffect(() => {
    if (isReady && isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        if (playerRef.current) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          setProgress(duration ? (time / duration) * 100 : 0);
        }
      }, 250);
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isReady, isPlaying, duration]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlayingRef.current) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMutedRef.current) playerRef.current.unMute();
    else playerRef.current.mute();
    setIsMuted(!isMutedRef.current);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) await containerRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // Not allowed or unsupported (e.g. iOS Safari) — the player still works inline.
    }
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const seek = useCallback((seconds: number) => {
    if (!playerRef.current || !durationRef.current) return;
    const newTime = Math.max(0, Math.min(durationRef.current, currentTimeRef.current + seconds));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    setProgress((newTime / durationRef.current) * 100);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'm') toggleMute();
      else if (e.key === 'f') toggleFullscreen();
      else if (e.key === 'ArrowLeft') seek(-10);
      else if (e.key === 'ArrowRight') seek(10);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, togglePlay, toggleMute, toggleFullscreen, seek]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlayingRef.current) {
      hideControlsTimeout.current = window.setTimeout(() => setShowControls(false), 3000);
    }
  }, []);

  const handleSeek = (value: number[]) => {
    if (!playerRef.current || !durationRef.current) return;
    const newTime = (value[0] / 100) * durationRef.current;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    setProgress(value[0]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Trailer'}
        tabIndex={-1}
        className="relative aspect-video w-full max-w-5xl overflow-hidden bg-black outline-none sm:rounded-lg sm:ring-1 sm:ring-white/15"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetControlsTimeout}
        onMouseEnter={() => setShowControls(true)}
        onTouchStart={resetControlsTimeout}
      >
        <div ref={playerNodeRef} id={playerId} className="h-full w-full" />

        <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-slow",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="pointer-events-auto flex items-center justify-between gap-3 bg-gradient-to-b from-black/85 to-transparent p-4">
            <h2 className="truncate font-display text-base font-semibold text-white">{title}</h2>
            <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/15 hover:text-white" onClick={onClose} aria-label="Close trailer">
              <X />
            </Button>
          </div>

          <div className="pointer-events-auto bg-gradient-to-t from-black/85 to-transparent p-4">
            <div className="mb-3">
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                aria-label="Seek"
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <VolumeX /> : <Volume2 />}
              </Button>
              <span className="numeral ml-1 font-mono text-sm text-white/90">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}>
                {isFullscreen ? <Minimize /> : <Maximize />}
              </Button>
            </div>
          </div>
        </div>

        {!isReady && !failed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
            <LoadingSpinner size="lg" label="Loading trailer" className="[&_svg]:text-white/70" />
          </div>
        )}

        {failed && (
          <div
            role="alert"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-xl font-semibold text-white">The trailer couldn't be played here.</p>
            <p className="max-w-sm text-sm text-white/70">
              It may be blocked by an extension or network, or the video can't be embedded.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              </Button>
              <Button variant="overlay" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
