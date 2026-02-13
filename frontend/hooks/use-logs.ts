'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { wsClient } from '@/lib/websocket-client';
import type { LogEntry, LogFilter, WSServerMessage, WSStatusHandler } from '@/types/log';

export function useLogs(filter?: LogFilter) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const subscribeParamsRef = useRef(filter);

  // Update filter ref
  useEffect(() => {
    subscribeParamsRef.current = filter;
  }, [filter]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let statusUnsubscribe: (() => void) | null = null;

    // Handle incoming messages
    const handleMessage = (message: WSServerMessage) => {
      if (message.type === 'log') {
        const logMessage = message as unknown as { data: LogEntry };
        setLogs((prev) => [logMessage.data, ...prev].slice(0, 1000)); // Keep last 1000 logs
      }
    };

    // Handle connection status
    const handleStatusChange: WSStatusHandler = (connected) => {
      setIsConnected(connected);

      if (connected) {
        // Subscribe to logs when connected
        wsClient.subscribe('logs', subscribeParamsRef.current as Record<string, unknown> | undefined);
      } else {
        // Unsubscribe when disconnected
        wsClient.unsubscribe('logs');
      }
    };

    // Register handlers
    unsubscribe = wsClient.on('log', handleMessage);
    statusUnsubscribe = wsClient.onStatusChange(handleStatusChange);

    // Connect to WebSocket
    wsClient.connect();

    return () => {
      unsubscribe?.();
      statusUnsubscribe?.();
      wsClient.disconnect();
    };
  }, []);

  // Resubscribe when filter changes
  useEffect(() => {
    if (isConnected) {
      // Unsubscribe first to avoid duplicate subscriptions
      wsClient.unsubscribe('logs');
      // Subscribe with new filter
      wsClient.subscribe('logs', filter as Record<string, unknown> | undefined);
    }
  }, [filter, isConnected]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    isConnected,
    clearLogs,
  };
}
