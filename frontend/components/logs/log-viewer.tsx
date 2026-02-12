'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { LogEntry } from '@/types/log';
import { cn } from '@/lib/utils';

interface LogViewerProps {
  logs: LogEntry[];
  isConnected: boolean;
}

export function LogViewer({ logs, isConnected }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLogCount = useRef(logs.length);

  useEffect(() => {
    if (logs.length > lastLogCount.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    lastLogCount.current = logs.length;
  }, [logs.length]);

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'bg-gray-500',
      info: 'bg-blue-500',
      warn: 'bg-yellow-500',
      error: 'bg-red-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <div className={cn(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
        )} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <ScrollArea className="h-[500px] w-full rounded-md border bg-black p-4">
        <div ref={scrollRef} className="space-y-1">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Waiting for logs...
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="font-mono text-sm flex gap-2">
                <span className="text-muted-foreground select-none">
                  {formatTime(log.timestamp)}
                </span>
                <Badge className={cn('h-5 px-1', getLevelColor(log.level))}>
                  {log.level.toUpperCase()}
                </Badge>
                {log.component !== 'all' && (
                  <Badge variant="outline" className="h-5 px-1">
                    {log.component}
                  </Badge>
                )}
                <span className={cn(
                  'break-all',
                  log.level === 'error' && 'text-red-500',
                  log.level === 'warn' && 'text-yellow-500'
                )}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
