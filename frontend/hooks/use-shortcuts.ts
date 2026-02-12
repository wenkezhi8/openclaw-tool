'use client';

import { useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description: string;
}

export function useShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          event.key === shortcut.key &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.metaKey === !!shortcut.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function useGatewayShortcuts(
  onRefresh: () => void,
  onStart: () => void,
  onStop: () => void,
  onRestart: () => void,
  enabled: boolean = true
) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'r',
      handler: onRefresh,
      description: 'Refresh',
    },
    {
      key: 's',
      handler: onStart,
      description: 'Start Gateway',
    },
    {
      key: 'x',
      handler: onStop,
      description: 'Stop Gateway',
    },
    {
      key: 'r',
      shiftKey: true,
      handler: onRestart,
      description: 'Restart Gateway',
    },
  ];

  return useShortcuts(shortcuts, enabled);
}
