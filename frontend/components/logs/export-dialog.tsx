'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks';
import type { LogEntry } from '@/types/log';

type ExportFormat = 'json' | 'csv' | 'txt';
type ExportScope = 'all' | 'filtered';

interface ExportDialogProps {
  allLogs: LogEntry[];
  filteredLogs: LogEntry[];
  trigger?: React.ReactNode;
}

export function ExportDialog({ allLogs, filteredLogs, trigger }: ExportDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [scope, setScope] = useState<ExportScope>('filtered');
  const [isExporting, setIsExporting] = useState(false);

  const formatOptions: { value: ExportFormat; label: string }[] = [
    { value: 'json', label: t('logs.exportFormats.json') || 'Export as JSON' },
    { value: 'csv', label: t('logs.exportFormats.csv') || 'Export as CSV' },
    { value: 'txt', label: t('logs.exportFormats.txt') || 'Export as Text' },
  ];

  const getLogsToExport = () => {
    return scope === 'all' ? allLogs : filteredLogs;
  };

  const generateFilename = (format: ExportFormat) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `openclaw-logs-${timestamp}.${format}`;
  };

  const formatAsJSON = (logs: LogEntry[]): string => {
    return JSON.stringify(logs, null, 2);
  };

  const formatAsCSV = (logs: LogEntry[]): string => {
    const headers = ['timestamp', 'level', 'component', 'message'];
    const rows = logs.map(log =>
      [log.timestamp, log.level, log.component, `"${log.message.replace(/"/g, '""')}"`].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const formatAsTXT = (logs: LogEntry[]): string => {
    return logs.map(log =>
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.component}] ${log.message}`
    ).join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const logs = getLogsToExport();
      const filename = generateFilename(format);

      let content: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = formatAsJSON(logs);
          mimeType = 'application/json';
          break;
        case 'csv':
          content = formatAsCSV(logs);
          mimeType = 'text/csv';
          break;
        case 'txt':
          content = formatAsTXT(logs);
          mimeType = 'text/plain';
          break;
      }

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      downloadFile(content, filename, mimeType);
      setOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">{t('logs.exportLogs') || 'Export logs'}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('logs.exportModal.title') || 'Export Logs'}</DialogTitle>
          <DialogDescription>
            Choose export format and which logs to include
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t('logs.exportModal.format') || 'Format'}</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('logs.exportModal.dateRange') || 'Scope'}</Label>
            <RadioGroup value={scope} onValueChange={(value: string) => setScope(value as ExportScope)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="filtered" id="filtered" />
                <Label htmlFor="filtered" className="font-normal cursor-pointer">
                  {t('logs.exportModal.filteredLogs') || 'Filtered Logs Only'}
                  <span className="text-muted-foreground ml-2">({filteredLogs.length} entries)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  {t('logs.exportModal.allLogs') || 'All Logs'}
                  <span className="text-muted-foreground ml-2">({allLogs.length} entries)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('logs.exportModal.exporting') || 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('common.export') || 'Export'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
