declare namespace YT {
  interface Player {
    destroy(): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    target: Player;
    data: number;
  }

  interface PlayerOptions {
    videoId?: string;
    width?: number | string;
    height?: number | string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1 | 2;
      modestbranding?: 0 | 1;
      rel?: 0 | 1;
      showinfo?: 0 | 1;
      iv_load_policy?: 1 | 3;
      fs?: 0 | 1;
      playsinline?: 0 | 1;
    };
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: { data: number }) => void;
    };
  }

  const PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}
