'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LogLevel } from '@/types/log';

interface LogLevelBadgeProps {
  level: LogLevel;
  className?: string;
}

const levelConfig: Record<LogLevel, { bg: string; text: string; border: string; icon: string }> = {
  debug: {
    bg: 'bg-slate-500/10 dark:bg-slate-400/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20 dark:border-slate-400/20',
    icon: '🔍',
  },
  info: {
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20 dark:border-blue-400/20',
    icon: 'ℹ️',
  },
  warn: {
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 dark:border-amber-400/20',
    icon: '⚠️',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-400/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20 dark:border-red-400/20',
    icon: '❌',
  },
};

export function LogLevelBadge({ level, className }: LogLevelBadgeProps) {
  const config = levelConfig[level];

  return (
    <Badge
      variant="outline"
      className={cn(
        'h-6 px-2 font-mono text-xs font-semibold border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className="mr-1" role="img" aria-label={`${level} level`}>
        {config.icon}
      </span>
      {level.toUpperCase()}
    </Badge>
  );
}
