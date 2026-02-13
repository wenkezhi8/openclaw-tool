'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { wsClient } from '@/lib/websocket-client';
import type { LogEntry } from '@/types/log';
import { Terminal, Trash2, Filter } from 'lucide-react';

type OperationType = 'all' | 'install' | 'update' | 'uninstall';

interface InstallTerminalProps {
  className?: string;
}

export function InstallTerminal({ className }: InstallTerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<OperationType>('all');
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedLogsRef = useRef<LogEntry[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    wsClient.connect();
    setIsConnected(wsClient.isConnected());

    // Subscribe to logs
    const unsubStatus = wsClient.onStatusChange((connected) => {
      setIsConnected(connected);
    });

    const unsubLog = wsClient.on('log', (message) => {
      const logEntry = message as unknown as LogEntry;
      if (!isPaused) {
        setLogs((prev) => [...prev.slice(-500), logEntry]); // Keep last 500 logs
      } else {
        pausedLogsRef.current.push(logEntry);
      }
    });

    return () => {
      unsubStatus();
      unsubLog();
    };
  }, [isPaused]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, isPaused]);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'text-gray-400',
      info: 'text-green-400',
      warn: 'text-yellow-400',
      error: 'text-red-400',
    };
    return colors[level] || 'text-gray-400';
  };

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'bg-gray-600',
      info: 'bg-green-600',
      warn: 'bg-yellow-600',
      error: 'bg-red-600',
    };
    return colors[level] || 'bg-gray-600';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const clearLogs = () => {
    setLogs([]);
    pausedLogsRef.current = [];
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume and add paused logs
      setLogs((prev) => [...prev, ...pausedLogsRef.current.slice(-100)]);
      pausedLogsRef.current = [];
    }
    setIsPaused(!isPaused);
  };

  // Detect operation type from log message
  const getOperationType = (message: string): OperationType => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('install') || lowerMsg.includes('安装')) return 'install';
    if (lowerMsg.includes('update') || lowerMsg.includes('updating') || lowerMsg.includes('更新')) return 'update';
    if (lowerMsg.includes('uninstall') || lowerMsg.includes('remove') || lowerMsg.includes('卸载')) return 'uninstall';
    return 'all';
  };

  // Filter logs based on selected operation type
  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => getOperationType(log.message) === filter);

  const filterButtons: { type: OperationType; label: string }[] = [
    { type: 'all', label: 'All' },
    { type: 'install', label: 'Install' },
    { type: 'update', label: 'Update' },
    { type: 'uninstall', label: 'Uninstall' },
  ];

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Terminal className="w-4 h-4 text-gray-300 ml-2" />
          <span className="text-sm text-gray-300 font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          )} />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-850 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-gray-500 mr-1" />
          {filterButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => setFilter(btn.type)}
              className={cn(
                'px-2 py-0.5 text-xs rounded transition-colors',
                filter === btn.type
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={togglePause}
            className={cn(
              'text-xs px-2 py-0.5 rounded transition-colors',
              isPaused
                ? 'bg-yellow-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={clearLogs}
            className="text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-gray-700 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <ScrollArea className="flex-1 bg-gray-900 rounded-b-lg">
        <div ref={scrollRef} className="p-3 font-mono text-sm min-h-[350px]">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500">
              <p>$ OpenClaw Tool Terminal</p>
              <p className="mt-2 text-xs">
                Real-time logs for Install, Update, and Uninstall operations.
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Click any action button to see the output here.
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const opType = getOperationType(log.message);
              return (
                <div key={`${log.timestamp}-${index}`} className="flex gap-2 py-0.5 group">
                  <span className="text-gray-500 select-none shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  <span className={cn(
                    'shrink-0 uppercase text-xs font-bold px-1 rounded',
                    getLevelBadgeColor(log.level)
                  )}>
                    {log.level}
                  </span>
                  {opType !== 'all' && (
                    <span className={cn(
                      'shrink-0 uppercase text-xs px-1 rounded',
                      opType === 'install' && 'bg-blue-600',
                      opType === 'update' && 'bg-purple-600',
                      opType === 'uninstall' && 'bg-orange-600',
                    )}>
                      {opType}
                    </span>
                  )}
                  <span className={cn(
                    'break-all',
                    log.level === 'error' && 'text-red-400',
                    log.level === 'warn' && 'text-yellow-400',
                    log.level === 'info' && 'text-green-400',
                  )}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div className="flex items-center text-gray-400 mt-2">
            <span className="text-green-400">$</span>
            <span className="ml-2 animate-pulse">_</span>
          </div>
        </div>
      </ScrollArea>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800/50 border-t border-gray-700 text-xs text-gray-500">
        <span>{filteredLogs.length} logs</span>
        <span>{isPaused ? 'Paused' : 'Streaming'}</span>
      </div>
    </div>
  );
}
