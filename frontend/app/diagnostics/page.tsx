'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks';
import { useI18n } from '@/lib/i18n';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Terminal,
  Server,
  Key,
  Globe,
  Settings,
  ExternalLink,
} from 'lucide-react';

// Backend diagnostic item structure
interface BackendDiagnosticItem {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  description: string;
  solution?: string;
  solutionLink?: string;
  details?: Record<string, unknown>;
}

interface BackendDiagnosticsResult {
  timestamp: string;
  items: BackendDiagnosticItem[];
  summary: {
    total: number;
    ok: number;
    warning: number;
    error: number;
  };
}

// Frontend display diagnostic item
interface DiagnosticItem {
  id: string;
  name: string;
  description: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}

// Map backend status to frontend status
function mapStatus(status: 'ok' | 'warning' | 'error'): 'success' | 'warning' | 'error' {
  if (status === 'ok') return 'success';
  return status;
}

// Map backend diagnostic ID to frontend ID
function mapDiagnosticId(backendId: string): string {
  const mapping: Record<string, string> = {
    'cli_installation': 'cli',
    'gateway_status': 'gateway',
    'api_key_config': 'apiKey',
    'platform_connectivity': 'platform',
  };
  return mapping[backendId] || backendId;
}

export default function DiagnosticsPage() {
  const { t } = useI18n();
  const { success: showSuccess, error: showError } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    {
      id: 'cli',
      name: 'OpenClaw CLI',
      description: 'Check CLI installation status',
      status: 'checking',
    },
    {
      id: 'gateway',
      name: 'Gateway Status',
      description: 'Check gateway running status',
      status: 'checking',
    },
    {
      id: 'apiKey',
      name: 'API Key',
      description: 'Check model API key configuration',
      status: 'checking',
    },
    {
      id: 'platform',
      name: 'Platform Connection',
      description: 'Check AI platform connectivity',
      status: 'checking',
    },
  ]);

  const updateDiagnostic = (id: string, updates: Partial<DiagnosticItem>) => {
    setDiagnostics((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const processBackendResults = useCallback((result: BackendDiagnosticsResult) => {
    for (const item of result.items) {
      const frontendId = mapDiagnosticId(item.id);
      updateDiagnostic(frontendId, {
        status: mapStatus(item.status),
        message: item.message,
        description: item.description,
        actionLabel: item.solution ? item.solution.split(' ').slice(0, 3).join(' ') : undefined,
        actionHref: item.solutionLink,
      });
    }
  }, []);

  const runAllDiagnostics = useCallback(async () => {
    setIsRunning(true);

    // Reset all to checking state
    setDiagnostics((prev) =>
      prev.map((item) => ({ ...item, status: 'checking' as const, message: undefined }))
    );

    try {
      // Use backend diagnostics API
      const response = await apiClient.get<BackendDiagnosticsResult>(API_ENDPOINTS.DIAGNOSTICS);

      if (response.data) {
        processBackendResults(response.data);
        showSuccess('Diagnostics complete');
      }
    } catch (error) {
      // Fallback to individual checks if backend diagnostics fails
      console.error('Backend diagnostics failed, falling back to individual checks:', error);

      // Mark all as error with helpful message
      setDiagnostics((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'error' as const,
          message: 'Unable to run diagnostics - backend service may be unavailable',
          actionLabel: 'Retry',
          actionHref: undefined,
        }))
      );

      showError('Failed to run diagnostics');
    } finally {
      setIsRunning(false);
    }
  }, [processBackendResults, showSuccess, showError]);

  // Run diagnostics once on mount
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
      runAllDiagnostics();
    }
  }, [hasLoaded, runAllDiagnostics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'checking':
        return <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
      default:
        return <Badge variant="secondary">Checking</Badge>;
    }
  };

  const getItemIcon = (id: string) => {
    switch (id) {
      case 'cli':
        return <Terminal className="h-5 w-5" />;
      case 'gateway':
        return <Server className="h-5 w-5" />;
      case 'apiKey':
        return <Key className="h-5 w-5" />;
      case 'platform':
        return <Globe className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const overallStatus = diagnostics.every((d) => d.status === 'success')
    ? 'success'
    : diagnostics.some((d) => d.status === 'error')
    ? 'error'
    : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('diagnostics.title', 'System Diagnostics')}
          </h1>
          <p className="text-muted-foreground">
            {t('diagnostics.subtitle', 'Check system status and configuration')}
          </p>
        </div>
        <Button onClick={runAllDiagnostics} disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t('diagnostics.runAgain', 'Run Again')}
        </Button>
      </div>

      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {overallStatus === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : overallStatus === 'error' ? (
              <XCircle className="h-6 w-6 text-red-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            )}
            {t('diagnostics.overallStatus', 'Overall Status')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {overallStatus === 'success'
              ? t('diagnostics.allGood', 'All checks passed, system is running normally')
              : overallStatus === 'error'
              ? t('diagnostics.hasErrors', 'There are issues that need to be fixed')
              : t('diagnostics.hasWarnings', 'There are some issues that need attention')}
          </p>
        </CardContent>
      </Card>

      {/* Diagnostic Items */}
      <div className="grid gap-4">
        {diagnostics.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  {getItemIcon(item.id)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  {item.message && (
                    <p className="text-sm">
                      {item.status === 'error' && <XCircle className="h-4 w-4 inline mr-1 text-red-500" />}
                      {item.status === 'warning' && <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-500" />}
                      {item.status === 'success' && <CheckCircle2 className="h-4 w-4 inline mr-1 text-green-500" />}
                      {item.message}
                    </p>
                  )}
                  {item.actionLabel && item.actionHref && (
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <a href={item.actionHref}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {item.actionLabel}
                      </a>
                    </Button>
                  )}
                </div>
                <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('diagnostics.help.title', 'Need Help?')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('diagnostics.help.description', 'If you encounter issues, try these steps:')}
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t('diagnostics.help.step1', 'Make sure the backend service is running')}</li>
            <li>{t('diagnostics.help.step2', 'Check network connection')}</li>
            <li>{t('diagnostics.help.step3', 'View logs for detailed error information')}</li>
            <li>{t('diagnostics.help.step4', 'Restart the gateway service')}</li>
          </ul>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" asChild>
              <a href="/logs">{t('diagnostics.help.viewLogs', 'View Logs')}</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/gateway">{t('diagnostics.help.gatewayControl', 'Gateway Control')}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
