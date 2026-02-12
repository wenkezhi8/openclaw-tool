'use client';

import { useLogs } from '@/hooks';
import { OptimizedLogViewer } from '@/components/logs';
import { useI18n } from '@/hooks';

export default function LogsPage() {
  const { t } = useI18n();
  const { logs, isConnected, clearLogs } = useLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('logs.title') || 'Logs'}</h1>
        <p className="text-muted-foreground">
          {t('logs.subtitle') || 'Real-time logs from OpenClaw Gateway and Agents'}
        </p>
      </div>

      <OptimizedLogViewer logs={logs} isConnected={isConnected} onClear={clearLogs} />
    </div>
  );
}
