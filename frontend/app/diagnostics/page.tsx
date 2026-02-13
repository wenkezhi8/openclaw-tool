'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  MessageSquare,
  Settings,
  ExternalLink,
  Wrench,
} from 'lucide-react';

interface DiagnosticItem {
  id: string;
  name: string;
  description: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function DiagnosticsPage() {
  const { t } = useI18n();
  const { success } = useToast();

  const [isRunning, setIsRunning] = useState(false);
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
      description: 'Check messaging platform connection',
      status: 'checking',
    },
  ]);

  // Use ref to avoid circular dependency in useCallback
  const runAllDiagnosticsRef = useRef<() => Promise<void>>();

  const updateDiagnostic = useCallback((id: string, updates: Partial<DiagnosticItem>) => {
    setDiagnostics((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const checkCli = useCallback(async () => {
    updateDiagnostic('cli', { status: 'checking' });
    try {
      const response = await apiClient.get(API_ENDPOINTS.INSTALL_STATUS);
      if (response.data?.installed) {
        updateDiagnostic('cli', {
          status: 'success',
          message: `CLI installed v${response.data.version || 'unknown'}`,
          action: undefined,
        });
      } else {
        updateDiagnostic('cli', {
          status: 'error',
          message: 'CLI not installed',
          action: {
            label: 'Install CLI',
            href: '/install',
          },
        });
      }
    } catch {
      updateDiagnostic('cli', {
        status: 'error',
        message: 'Check failed',
        action: {
          label: 'Retry',
          onClick: () => runAllDiagnosticsRef.current?.(),
        },
      });
    }
  }, [updateDiagnostic]);

  const checkGateway = useCallback(async () => {
    updateDiagnostic('gateway', { status: 'checking' });
    try {
      const response = await apiClient.get(API_ENDPOINTS.GATEWAY_STATUS);
      if (response.data?.status === 'running') {
        updateDiagnostic('gateway', {
          status: 'success',
          message: `Gateway running on port ${response.data.port || 'unknown'}`,
          action: undefined,
        });
      } else if (response.data?.status === 'stopped') {
        updateDiagnostic('gateway', {
          status: 'warning',
          message: 'Gateway stopped',
          action: {
            label: 'Start Gateway',
            href: '/gateway',
          },
        });
      } else {
        updateDiagnostic('gateway', {
          status: 'error',
          message: 'Unknown status',
          action: {
            label: 'View Details',
            href: '/gateway',
          },
        });
      }
    } catch {
      updateDiagnostic('gateway', {
        status: 'error',
        message: 'Cannot connect to gateway',
        action: {
          label: 'Fix Issue',
          href: '/gateway',
        },
      });
    }
  }, [updateDiagnostic]);

  const checkApiKey = useCallback(async () => {
    updateDiagnostic('apiKey', { status: 'checking' });
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHANNELS);
      const channels = response.data || [];
      const configuredChannels = channels.filter((ch: { apiKey?: string }) => ch.apiKey);

      if (configuredChannels.length > 0) {
        updateDiagnostic('apiKey', {
          status: 'success',
          message: `${configuredChannels.length} model channels configured`,
          action: undefined,
        });
      } else {
        updateDiagnostic('apiKey', {
          status: 'warning',
          message: 'No API key configured',
          action: {
            label: 'Configure Key',
            href: '/channels',
          },
        });
      }
    } catch {
      updateDiagnostic('apiKey', {
        status: 'warning',
        message: 'Cannot check configuration',
        action: {
          label: 'Go to Settings',
          href: '/settings',
        },
      });
    }
  }, [updateDiagnostic]);

  const checkPlatform = useCallback(async () => {
    updateDiagnostic('platform', { status: 'checking' });
    try {
      const response = await apiClient.get(API_ENDPOINTS.MESSAGING_CHANNELS);
      const channels = response.data || [];
      const connectedChannels = channels.filter(
        (ch: { status?: string }) => ch.status === 'connected'
      );

      if (connectedChannels.length > 0) {
        updateDiagnostic('platform', {
          status: 'success',
          message: `${connectedChannels.length} platforms connected`,
          action: undefined,
        });
      } else if (channels.length > 0) {
        updateDiagnostic('platform', {
          status: 'warning',
          message: 'Platform not connected',
          action: {
            label: 'Connect Platform',
            href: '/messaging',
          },
        });
      } else {
        updateDiagnostic('platform', {
          status: 'warning',
          message: 'No messaging platform configured',
          action: {
            label: 'Add Platform',
            href: '/messaging',
          },
        });
      }
    } catch {
      updateDiagnostic('platform', {
        status: 'warning',
        message: 'Cannot check platform status',
        action: {
          label: 'View Platforms',
          href: '/messaging',
        },
      });
    }
  }, [updateDiagnostic]);

  const runAllDiagnostics = useCallback(async () => {
    setIsRunning(true);
    await Promise.all([checkCli(), checkGateway(), checkApiKey(), checkPlatform()]);
    setIsRunning(false);
    success('Diagnostics complete');
  }, [checkCli, checkGateway, checkApiKey, checkPlatform, success]);

  // Store the function in ref
  useEffect(() => {
    runAllDiagnosticsRef.current = runAllDiagnostics;
  }, [runAllDiagnostics]);

  useEffect(() => {
    runAllDiagnostics();
  }, [runAllDiagnostics]);

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
        return <MessageSquare className="h-5 w-5" />;
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
                  {item.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      asChild={!item.action.onClick}
                    >
                      {item.action.onClick ? (
                        <button onClick={item.action.onClick}>
                          <Wrench className="h-4 w-4 mr-2" />
                          {item.action.label}
                        </button>
                      ) : item.action.href ? (
                        <a href={item.action.href}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {item.action.label}
                        </a>
                      ) : null}
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
