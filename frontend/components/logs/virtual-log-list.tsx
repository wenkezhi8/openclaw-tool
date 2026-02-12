'use client';

import { useEffect, useRef, useState } from 'react';
import { LogEntry } from './log-entry';
import type { LogEntry as LogEntryType } from '@/types/log';

interface VirtualLogListProps {
  logs: LogEntryType[];
  itemHeight?: number;
  containerHeight?: number;
  bufferSize?: number;
}

export function VirtualLogList({
  logs,
  itemHeight = 32,
  containerHeight = 500,
  bufferSize = 5,
}: VirtualLogListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLogCountRef = useRef(logs.length);

  // Detect user scroll to disable auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      // Disable auto-scroll if user scrolls up more than 100px from bottom
      if (distanceToBottom > 100) {
        setIsAutoScroll(false);
      } else if (distanceToBottom < 50) {
        setIsAutoScroll(true);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logs.length > lastLogCountRef.current && isAutoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    lastLogCountRef.current = logs.length;
  }, [logs.length, isAutoScroll]);

  const totalHeight = logs.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.min(
    logs.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
  );
  const visibleLogs = logs.slice(startIndex, endIndex);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{ height: totalHeight, minHeight: containerHeight }}
      >
        <div
          className="absolute w-full"
          style={{ transform: `translateY(${startIndex * itemHeight}px)` }}
        >
          {visibleLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-8">
              Waiting for logs...
            </div>
          ) : (
            visibleLogs.map((log, idx) => (
              <LogEntry key={`${log.timestamp}-${idx}`} log={log} index={startIndex + idx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
