'use client';

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
  className,
}: RefreshIndicatorProps) {
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
      <RefreshCw
        className={cn(
          'h-4 w-4 transition-colors',
          isRefetching ? 'animate-spin text-primary' : 'text-muted-foreground'
        )}
      />
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
