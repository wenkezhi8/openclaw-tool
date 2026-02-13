'use client';

import { useGatewayStatus, useGatewayActions, useGatewayMetrics } from '@/hooks';
import { GatewayStatusCard, GatewayControlButtons, GatewayMetricsPanel } from '@/components/gateway';
import { LoadingSpinner, HelpButton } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Zap, Server, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useQueryClient } from '@tanstack/react-query';

const GATEWAY_QUERY_KEY = [['gateway']] as const;

export default function DashboardPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data: status, isLoading: statusLoading, error: statusError } = useGatewayStatus();
  const { data: metrics, isLoading: metricsLoading } = useGatewayMetrics();
  const { startGateway, stopGateway, restartGateway, isLoading: actionLoading } = useGatewayActions();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: GATEWAY_QUERY_KEY });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <HelpButton page="dashboard" />
      </div>

      {/* Backend connection warning */}
      {statusError && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-500">
                {t('gateway.errors.loadFailed')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('gateway.errors.loadFailedHint')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              {t('gateway.actions.refresh')}
            </Button>
          </CardContent>
        </Card>
      )}

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
              onRefresh={handleRefresh}
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
              {metrics && metrics.requests.total > 0
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
