'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import type { GatewayMetricsResponse } from '@/types/gateway';
import { cn } from '@/lib/utils';
import { RefreshIndicator } from './refresh-indicator';
import { useI18n } from '@/hooks';

export interface GatewayMetricsPanelProps {
  metrics: GatewayMetricsResponse | undefined;
  isLoading: boolean;
  isRefetching?: boolean;
  lastUpdateTime?: Date;
}

export function GatewayMetricsPanel({
  metrics,
  isLoading,
  isRefetching = false,
  lastUpdateTime,
}: GatewayMetricsPanelProps) {
  const { t } = useI18n();

  const texts = {
    title: t('gateway.metrics'),
    totalRequests: t('gateway.totalRequests'),
    throughput: t('gateway.throughput'),
    requestsPerSecond: t('gateway.requestsPerSecond'),
    successRate: t('gateway.successRate'),
    errors: t('common.error'),
    p50Latency: t('gateway.p50Latency'),
    p95Latency: t('gateway.p95Latency'),
    p99Latency: t('gateway.p99Latency'),
    milliseconds: t('gateway.milliseconds'),
    percent: t('gateway.percent'),
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {texts.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-8 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
            <div className="h-px bg-muted" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = metrics
    ? ((metrics.requests.success / metrics.requests.total) * 100).toFixed(2)
    : '0.00';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {texts.title}
          </CardTitle>
          {lastUpdateTime && (
            <RefreshIndicator
              isRefetching={isRefetching}
              lastUpdateTime={lastUpdateTime}
              autoRefresh
              refreshInterval={10000}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            icon={Zap}
            label={texts.totalRequests}
            value={metrics?.requests.total || 0}
            variant="default"
          />
          <MetricCard
            icon={Activity}
            label={texts.throughput}
            value={metrics?.throughput || 0}
            unit={texts.requestsPerSecond}
            variant="default"
          />
          <MetricCard
            icon={TrendingUp}
            label={texts.successRate}
            value={successRate}
            unit={texts.percent}
            variant="success"
          />
          <MetricCard
            icon={TrendingDown}
            label={texts.errors}
            value={metrics?.requests.error || 0}
            variant="error"
          />
        </div>
        {metrics && (
          <>
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Latency Distribution</h3>
              <LatencyBars metrics={metrics} />
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <LatencyRow
                label={texts.p50Latency}
                value={metrics.latency.p50}
                max={Math.max(metrics.latency.p50, metrics.latency.p95, metrics.latency.p99)}
                unit={texts.milliseconds}
              />
              <LatencyRow
                label={texts.p95Latency}
                value={metrics.latency.p95}
                max={Math.max(metrics.latency.p50, metrics.latency.p95, metrics.latency.p99)}
                unit={texts.milliseconds}
              />
              <LatencyRow
                label={texts.p99Latency}
                value={metrics.latency.p99}
                max={Math.max(metrics.latency.p50, metrics.latency.p95, metrics.latency.p99)}
                unit={texts.milliseconds}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit?: string;
  variant?: 'default' | 'success' | 'error';
}

function MetricCard({ icon: Icon, label, value, unit, variant = 'default' }: MetricCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', getIconColor())} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn('text-xl font-bold tabular-nums', getValueColor())}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
}

interface LatencyRowProps {
  label: string;
  value: number;
  max: number;
  unit: string;
}

function LatencyRow({ label, value, max, unit }: LatencyRowProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value}
          <span className="text-muted-foreground text-xs ml-1">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            percentage > 80
              ? 'bg-orange-500'
              : percentage > 50
              ? 'bg-yellow-500'
              : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function LatencyBars({
  metrics,
}: {
  metrics: GatewayMetricsResponse;
}) {
  const maxValue = Math.max(metrics.latency.p50, metrics.latency.p95, metrics.latency.p99);

  return (
    <div className="flex items-end gap-1 h-16">
      <LatencyBar
        value={metrics.latency.p50}
        max={maxValue}
        label="p50"
        color="bg-green-500"
      />
      <LatencyBar
        value={metrics.latency.p95}
        max={maxValue}
        label="p95"
        color="bg-yellow-500"
      />
      <LatencyBar
        value={metrics.latency.p99}
        max={maxValue}
        label="p99"
        color="bg-orange-500"
      />
    </div>
  );
}

interface LatencyBarProps {
  value: number;
  max: number;
  label: string;
  color: string;
}

function LatencyBar({ value, max, label, color }: LatencyBarProps) {
  const height = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full bg-muted rounded-t-sm relative h-12">
        <div
          className={cn('absolute bottom-0 w-full rounded-t-sm transition-all duration-500', color)}
          style={{ height: `${height}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
