'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface RefreshIndicatorProps {
  isRefetching: boolean;
  lastUpdateTime?: Date;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export function RefreshIndicator({
  isRefetching,
  lastUpdateTime,
  autoRefresh = false,
  refreshInterval,
  className,
}: RefreshIndicatorProps) {
  const shouldAnimate = autoRefresh && refreshInterval && !isRefetching;
  const interval = 100;
  const step = refreshInterval ? 100 / (refreshInterval / interval) : 0;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (shouldAnimate) {
      timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + step;
          return next >= 100 ? 0 : next;
        });
      }, interval);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [shouldAnimate, step, progress]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <div className="relative">
        <RefreshCw
          className={cn(
            'h-4 w-4 transition-colors',
            isRefetching ? 'animate-spin text-primary' : 'text-muted-foreground'
          )}
        />
        {autoRefresh && !isRefetching && (
          <svg className="absolute -top-0.5 -left-0.5 h-5 w-5 -rotate-90" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.2"
            />
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress * 0.5} 100`}
              className="text-primary"
            />
          </svg>
        )}
      </div>
      <span className="tabular-nums">
        {isRefetching ? (
          'Updating...'
        ) : lastUpdateTime ? (
          formatTimeAgo(lastUpdateTime)
        ) : (
          'Not updated'
        )}
      </span>
      {autoRefresh && (
        <span className="text-xs text-muted-foreground/70">
          (auto)
        </span>
      )}
    </div>
  );
}
