import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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

  // Load YouTube IFrame API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!playerNodeRef.current) return;
      playerRef.current = new (window as any).YT.Player(playerNodeRef.current, {
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
            setIsPlaying(event.data === (window as any).YT.PlayerState.PLAYING);
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        initPlayer();
      };
    }

    return () => {
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
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
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
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl aspect-video bg-black"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={resetControlsTimeout}
        onMouseEnter={() => setShowControls(true)}
        onTouchStart={resetControlsTimeout}
      >
        <div ref={playerNodeRef} id={playerId} className="w-full h-full" />

        <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />

        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
            <h3 className="text-white font-medium truncate">{title}</h3>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 p-0" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
            <div className="mb-3">
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&>span:first-child>span]:bg-primary"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-9 w-9 p-0" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-9 w-9 p-0" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-9 w-9 p-0" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
