'use client';

import { useGatewayStatus, useGatewayActions, useGatewayMetrics } from '@/hooks';
import { GatewayStatusCard, GatewayControlButtons, GatewayMetricsPanel } from '@/components/gateway';
import { ErrorMessage, LoadingSpinner } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Zap, Server } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function DashboardPage() {
  const { t } = useI18n();
  const { data: status, isLoading: statusLoading, error: statusError } = useGatewayStatus();
  const { data: metrics, isLoading: metricsLoading } = useGatewayMetrics();
  const { startGateway, stopGateway, restartGateway, isLoading: actionLoading } = useGatewayActions();

  if (statusError) {
    return (
      <ErrorMessage
        title={t('gateway.errors.loadFailed')}
        message={t('gateway.errors.loadFailedHint')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GatewayStatusCard status={status} isLoading={statusLoading} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t('gateway.control')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GatewayControlButtons
              status={status?.status}
              isLoading={actionLoading}
              onStart={startGateway}
              onStop={stopGateway}
              onRestart={restartGateway}
            />
          </CardContent>
        </Card>
      </div>

      <GatewayMetricsPanel metrics={metrics} isLoading={metricsLoading} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gateway.totalRequests')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.requests.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('gateway.sinceStart')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gateway.successRate')}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics
                ? ((metrics.requests.success / metrics.requests.total) * 100).toFixed(1)
                : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('gateway.ofAllRequests')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('gateway.avgLatency')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.latency.p95 || 0}{t('gateway.milliseconds')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('gateway.p95Latency')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
