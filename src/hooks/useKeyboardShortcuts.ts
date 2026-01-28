import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onEscape?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onEscape,
  onArrowLeft,
  onArrowRight,
  onArrowUp,
  onArrowDown,
  enabled = true,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'ArrowLeft':
          onArrowLeft?.();
          break;
        case 'ArrowRight':
          onArrowRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onArrowDown?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape, onArrowLeft, onArrowRight, onArrowUp, onArrowDown]);
}
