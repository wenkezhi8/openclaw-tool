'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Cpu, HardDrive, Activity, Server } from 'lucide-react';
import type { GatewayStatusResponse } from '@/types/gateway';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RefreshIndicator } from './refresh-indicator';
import { useI18n } from '@/hooks';

export interface GatewayStatusCardProps {
  status: GatewayStatusResponse | undefined;
  isLoading: boolean;
  isRefetching?: boolean;
  lastUpdateTime?: Date;
}

export function GatewayStatusCard({
  status,
  isRefetching = false,
  lastUpdateTime,
}: GatewayStatusCardProps) {
  const { t } = useI18n();

  const texts = {
    title: t('gateway.status'),
    statusIndicator: t('gateway.statusIndicator'),
    running: t('gateway.running'),
    stopped: t('gateway.stopped'),
    error: t('gateway.error'),
    unknown: t('gateway.unknown'),
    uptime: t('gateway.uptime'),
    cpuUsage: t('gateway.cpuUsage'),
    memoryUsage: t('gateway.memoryUsage'),
    pid: t('gateway.pid'),
    port: t('gateway.port'),
    runningOnPort: t('gateway.runningOnPort'),
    notRunning: t('gateway.notRunning'),
    hours: t('gateway.hours'),
    minutes: t('gateway.minutes'),
    seconds: t('gateway.seconds'),
    megabytes: t('gateway.megabytes'),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {texts.title}
          </span>
          <StatusBadge status={status?.status} texts={texts} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.status === 'running' ? (
          <>
            <MetricsGrid status={status} texts={texts} />
            {status.port && (
              <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                {texts.runningOnPort}:{' '}
                <span className="font-medium text-foreground">{status.port}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-3">
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {texts.notRunning}
            </p>
          </div>
        )}
        {status?.lastError && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            Error: {status.lastError}
          </div>
        )}
        {lastUpdateTime && (
          <RefreshIndicator
            isRefetching={isRefetching}
            lastUpdateTime={lastUpdateTime}
            autoRefresh
            refreshInterval={5000}
            className="pt-2 border-t"
          />
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  status?: string;
  texts: Record<string, string>;
}

function StatusBadge({ status, texts }: StatusBadgeProps) {
  const getStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'running':
        return 'default';
      case 'stopped':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'running':
        return texts.running;
      case 'stopped':
        return texts.stopped;
      case 'error':
        return texts.error;
      default:
        return texts.unknown;
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className="capitalize">
      <span className={cn(
        'mr-1.5 h-2 w-2 rounded-full',
        status === 'running' && 'bg-current animate-pulse',
        status === 'stopped' && 'bg-current',
        status === 'error' && 'bg-current',
        !status && 'bg-muted-foreground'
      )} />
      {getStatusText(status)}
    </Badge>
  );
}

interface MetricsGridProps {
  status: GatewayStatusResponse;
  texts: Record<string, string>;
}

function MetricsGrid({ status, texts }: MetricsGridProps) {
  const metrics = [
    {
      icon: Clock,
      label: texts.uptime,
      value: formatUptime(status.uptime, texts),
    },
    {
      icon: Cpu,
      label: texts.cpuUsage,
      value: status.cpu ? `${status.cpu.toFixed(1)}%` : 'N/A',
      progress: status.cpu ? status.cpu : undefined,
    },
    {
      icon: HardDrive,
      label: texts.memoryUsage,
      value: formatMemory(status.memory?.rss, texts),
      details: status.memory ? [
        `Heap: ${formatMemory(status.memory.heapUsed, texts)} / ${formatMemory(status.memory.heapTotal, texts)}`,
      ] : undefined,
    },
    {
      icon: Activity,
      label: texts.pid,
      value: status.pid?.toString() || 'N/A',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((metric) => (
        <MetricItem key={metric.label} {...metric} />
      ))}
    </div>
  );
}

interface MetricItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  progress?: number;
  details?: string[];
}

function MetricItem({ icon: Icon, label, value, progress, details }: MetricItemProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      {progress !== undefined && (
        <Progress value={progress} className="h-1.5" />
      )}
      {details && (
        <div className="pl-6 space-y-0.5">
          {details.map((detail, idx) => (
            <div key={idx} className="text-xs text-muted-foreground">
              {detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatUptime(seconds?: number, texts?: Record<string, string>): string {
  if (!seconds) return `0${texts?.seconds || 's'}`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const h = texts?.hours || 'h';
  const m = texts?.minutes || 'm';
  const s = texts?.seconds || 's';

  if (hours > 0) {
    return `${hours}${h} ${minutes}${m}`;
  }
  if (minutes > 0) {
    return `${minutes}${m} ${secs}${s}`;
  }
  return `${secs}${s}`;
}

function formatMemory(bytes?: number, texts?: Record<string, string>): string {
  if (!bytes) return `0 ${texts?.megabytes || 'MB'}`;
  return `${(bytes / 1024 / 1024).toFixed(2)} ${texts?.megabytes || 'MB'}`;
}
