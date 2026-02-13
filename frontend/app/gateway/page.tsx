'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGatewayStatus, useGatewayActions, useGatewayMetrics, useGatewayShortcuts } from '@/hooks';
import { GatewayStatusCard, GatewayControlButtons, GatewayMetricsPanel } from '@/components/gateway';
import { ErrorMessage } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks';

const GATEWAY_QUERY_KEY = [['gateway']] as const;

export default function GatewayPage() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { data: status, isLoading: statusLoading, isRefetching: statusRefetching, error: statusError } = useGatewayStatus();
  const { data: metrics, isLoading: metricsLoading, isRefetching: metricsRefetching } = useGatewayMetrics('24h');
  const { startGateway, stopGateway, restartGateway, isLoading: actionLoading } = useGatewayActions();

  const [lastStatusUpdate, setLastStatusUpdate] = useState<Date | undefined>();
  const [lastMetricsUpdate, setLastMetricsUpdate] = useState<Date | undefined>();

  const statusRef = useRef<typeof status>(undefined);
  const metricsRef = useRef<typeof metrics>(undefined);
  const hasInitializedStatus = useRef(false);
  const hasInitializedMetrics = useRef(false);

  useEffect(() => {
    if (status && !statusLoading) {
      if (!hasInitializedStatus.current || status !== statusRef.current) {
        statusRef.current = status;
        hasInitializedStatus.current = true;
        setLastStatusUpdate(new Date());
      }
    }
  }, [status, statusLoading]);

  useEffect(() => {
    if (metrics && !metricsLoading) {
      if (!hasInitializedMetrics.current || metrics !== metricsRef.current) {
        metricsRef.current = metrics;
        hasInitializedMetrics.current = true;
        setLastMetricsUpdate(new Date());
      }
    }
  }, [metrics, metricsLoading]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: GATEWAY_QUERY_KEY });
  }, [queryClient]);

  const handleStart = useCallback(() => {
    startGateway();
  }, [startGateway]);

  const handleStop = useCallback(() => {
    stopGateway();
  }, [stopGateway]);

  const handleRestart = useCallback(() => {
    restartGateway();
  }, [restartGateway]);

  // Keyboard shortcuts
  useGatewayShortcuts(
    handleRefresh,
    handleStart,
    handleStop,
    handleRestart,
    true
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('gateway.title')}</h1>
          <p className="text-muted-foreground">
            {t('gateway.subtitle')}
          </p>
        </div>
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
        <GatewayStatusCard
          status={status}
          isLoading={statusLoading}
          isRefetching={statusRefetching}
          lastUpdateTime={lastStatusUpdate}
        />
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{t('gateway.control')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('gateway.controlDescription')}
            </p>
          </div>
          <GatewayControlButtons
            status={status?.status}
            isLoading={actionLoading}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      <GatewayMetricsPanel
        metrics={metrics}
        isLoading={metricsLoading}
        isRefetching={metricsRefetching}
        lastUpdateTime={lastMetricsUpdate}
      />
    </div>
  );
}
