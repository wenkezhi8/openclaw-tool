'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGatewayStatus, useGatewayActions, useGatewayMetrics, useGatewayShortcuts } from '@/hooks';
import { GatewayStatusCard, GatewayControlButtons, GatewayMetricsPanel } from '@/components/gateway';
import { ErrorMessage } from '@/components/common';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('gateway.title')}</h1>
          <p className="text-muted-foreground">
            {t('gateway.subtitle')}
          </p>
        </div>
      </div>

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
