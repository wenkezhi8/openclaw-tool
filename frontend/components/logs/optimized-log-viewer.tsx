'use client';

import { useState, useMemo } from 'react';
import { VirtualLogList } from './virtual-log-list';
import { AdvancedFilter } from './advanced-filter';
import { ExportDialog } from './export-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogEntry, LogLevel, LogComponent } from '@/types/log';
import { useI18n } from '@/hooks';

interface OptimizedLogViewerProps {
  logs: LogEntry[];
  isConnected: boolean;
  onClear: () => void;
}

interface AdvancedFilters {
  useRegex: boolean;
  caseSensitive: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export function OptimizedLogViewer({ logs, isConnected, onClear }: OptimizedLogViewerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LogLevel | 'all'>('all');
  const [component, setComponent] = useState<LogComponent | 'all'>('all');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    useRegex: false,
    caseSensitive: false,
  });
  const [isPaused, setIsPaused] = useState(false);

  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by level
    if (level !== 'all') {
      result = result.filter(log => log.level === level);
    }

    // Filter by component
    if (component !== 'all') {
      result = result.filter(log => log.component === component);
    }

    // Filter by search term
    if (search) {
      const searchTerm = advancedFilters.caseSensitive ? search : search.toLowerCase();
      const searchFn = advancedFilters.useRegex
        ? (text: string) => {
            try {
              const regex = new RegExp(searchTerm, advancedFilters.caseSensitive ? '' : 'i');
              return regex.test(text);
            } catch {
              return false;
            }
          }
        : (text: string) => {
            const compareText = advancedFilters.caseSensitive ? text : text.toLowerCase();
            return compareText.includes(searchTerm);
          };

      result = result.filter(log => searchFn(log.message));
    }

    // Filter by date range
    if (advancedFilters.dateFrom) {
      const fromDate = new Date(advancedFilters.dateFrom);
      result = result.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (advancedFilters.dateTo) {
      const toDate = new Date(advancedFilters.dateTo);
      result = result.filter(log => new Date(log.timestamp) <= toDate);
    }

    return result;
  }, [logs, level, component, search, advancedFilters]);

  return (
    <div className="space-y-4">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected
              ? t('logs.connected') || 'Connected'
              : t('logs.disconnected') || 'Disconnected'}
          </span>
          <span className="text-sm text-muted-foreground">
            ({filteredLogs.length} / {logs.length} {t('logs.title') || 'logs'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume streaming' : 'Pause streaming'}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={onClear}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t('logs.clearLogs') || 'Clear logs'}</span>
          </Button>
          <ExportDialog allLogs={logs} filteredLogs={filteredLogs} />
        </div>
      </div>

      {/* Advanced Filter */}
      <AdvancedFilter
        search={search}
        level={level}
        component={component}
        onSearchChange={setSearch}
        onLevelChange={setLevel}
        onComponentChange={setComponent}
        onAdvancedFiltersChange={setAdvancedFilters}
      />

      {/* Virtual Log List */}
      <div className="rounded-lg border bg-black/50 dark:bg-black">
        <VirtualLogList logs={filteredLogs} />
      </div>
    </div>
  );
}
