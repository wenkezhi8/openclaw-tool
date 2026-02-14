'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Coins, TrendingUp, Calendar, Activity, BarChart3 } from 'lucide-react';
import type { GatewayMetricsResponse } from '@/types/gateway';
import { cn } from '@/lib/utils';
import { RefreshIndicator } from './refresh-indicator';
import { useI18n } from '@/hooks';

export interface GatewayMetricsPanelProps {
  metrics: GatewayMetricsResponse | undefined;
  isLoading: boolean;
  isRefetching?: boolean;
  lastUpdateTime?: Date;
  gatewayRunning?: boolean;
}

export function GatewayMetricsPanel({
  metrics,
  isLoading,
  isRefetching = false,
  lastUpdateTime,
  gatewayRunning = false,
}: GatewayMetricsPanelProps) {
  const { t } = useI18n();

  const texts = {
    title: t('gateway.metrics'),
    usageCost: t('gateway.usageCost'),
    totalCost: t('gateway.totalCost'),
    totalTokens: t('gateway.totalTokens'),
    latestDay: t('gateway.latestDay'),
    latestDayCost: t('gateway.latestDayCost'),
    latestDayTokens: t('gateway.latestDayTokens'),
    estimatedRequests: t('gateway.estimatedRequests'),
    notRunning: t('gateway.notRunning'),
    period30Days: t('gateway.period30Days'),
  };

  // Show empty state when gateway is not running
  if (!gatewayRunning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {texts.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-3">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {texts.notRunning}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format numbers for display
  const formatCost = (cost: number) => {
    if (cost === 0) return '$0.00';
    if (cost < 0.01) return `< $0.01`;
    return `$${cost.toFixed(4)}`;
  };

  // Check if using self-hosted model (cost is 0 but has token usage)
  const hasTokenUsage = (metrics?.totalTokens || 0) > 0;
  const isZeroCost = (metrics?.totalCost || 0) === 0;
  const isSelfHostedModel = hasTokenUsage && isZeroCost;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(2)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {texts.usageCost}
          </CardTitle>
          <div className="flex items-center gap-2">
            {metrics?.latestDay && (
              <span className="text-xs text-muted-foreground">
                {texts.period30Days}
              </span>
            )}
            {lastUpdateTime && (
              <RefreshIndicator
                isRefetching={isRefetching}
                lastUpdateTime={lastUpdateTime}
                autoRefresh
                refreshInterval={30000}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Self-hosted model notice */}
        {isSelfHostedModel && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-600 dark:text-green-400">
              Using self-hosted models - no API costs incurred
            </p>
          </div>
        )}
        {/* 30-day summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={DollarSign}
            label={texts.totalCost}
            value={formatCost(metrics?.totalCost || 0)}
            variant="success"
          />
          <MetricCard
            icon={Coins}
            label={texts.totalTokens}
            value={formatTokens(metrics?.totalTokens || 0)}
            variant="default"
          />
          <MetricCard
            icon={TrendingUp}
            label={texts.latestDayCost}
            value={formatCost(metrics?.latestDayCost || 0)}
            variant="default"
          />
          <MetricCard
            icon={Calendar}
            label={texts.latestDayTokens}
            value={formatTokens(metrics?.latestDayTokens || 0)}
            variant="default"
          />
        </div>

        {/* Latest day info */}
        {metrics?.latestDay && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{texts.latestDay}:</span>
              <span className="font-medium">{metrics.latestDay}</span>
            </div>
          </div>
        )}

        {/* Estimated requests (if available) */}
        {metrics?.requests?.total && metrics.requests.total > 0 && (
          <div className="pt-4 border-t mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{texts.estimatedRequests}:</span>
              <span className="font-medium tabular-nums">
                {metrics.requests.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'error';
}

function MetricCard({ icon: Icon, label, value, variant = 'default' }: MetricCardProps) {
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
        {value}
      </p>
    </div>
  );
}
