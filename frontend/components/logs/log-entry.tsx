'use client';

import { memo } from 'react';
import { LogLevelBadge } from './log-level-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LogEntry as LogEntryType } from '@/types/log';

interface LogEntryProps {
  log: LogEntryType;
  index: number;
}

export const LogEntry = memo(function LogEntry({ log, index }: LogEntryProps) {
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

  const getMessageColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'text-slate-300 dark:text-slate-400',
      info: 'text-blue-200 dark:text-blue-300',
      warn: 'text-amber-200 dark:text-amber-300',
      error: 'text-red-200 dark:text-red-300',
    };
    return colors[level] || 'text-slate-200';
  };

  const getBgColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'hover:bg-slate-500/5',
      info: 'hover:bg-blue-500/5',
      warn: 'hover:bg-amber-500/5',
      error: 'hover:bg-red-500/5',
    };
    return colors[level] || 'hover:bg-slate-500/5';
  };

  return (
    <div
      className={cn(
        'font-mono text-xs sm:text-sm flex gap-2 items-start py-1 px-2 rounded transition-colors duration-150',
        getBgColor(log.level)
      )}
      data-log-index={index}
      data-log-level={log.level}
    >
      <span className="text-muted-foreground/70 select-none flex-shrink-0 min-w-[80px] sm:min-w-[100px]">
        {formatTime(log.timestamp)}
      </span>
      <LogLevelBadge level={log.level} />
      {log.component !== 'all' && (
        <Badge
          variant="outline"
          className="h-6 px-2 text-xs border-slate-500/20 text-slate-400 flex-shrink-0"
        >
          {log.component}
        </Badge>
      )}
      <span className={cn('break-all flex-1', getMessageColor(log.level))}>
        {log.message}
      </span>
    </div>
  );
});
