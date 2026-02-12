'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { InstallStatus } from '@/types/install';
import { useI18n } from '@/hooks';

interface InstallStatusCardProps {
  status: InstallStatus;
}

export function InstallStatusCard({
  status,
}: InstallStatusCardProps) {  const { t } = useI18n();

  const formatPath = (path?: string) => {
    if (!path) return '';
    // Truncate long paths
    if (path.length > 50) {
      return path.substring(0, 23) + '...' + path.substring(path.length - 24);
    }
    return path;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('install.statusTitle') || 'Installation Status'}</span>
          {status.installed ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t('install.installed') || 'Installed'}
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              {t('install.notInstalled') || 'Not Installed'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {status.installed
            ? (t('install.statusDescription.installed') || 'OpenClaw CLI v{version} is installed at {path}').replace('{version}', status.version || 'unknown').replace('{path}', formatPath(status.path))
            : t('install.statusDescription.notInstalled') || 'OpenClaw CLI is not installed on this system'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Version Info */}
        {status.installed && status.version && (
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-sm text-muted-foreground">{t('install.version') || 'Version'}</span>
            <span className="font-medium font-mono">{status.version}</span>
          </div>
        )}

        {/* Latest Version */}
        {status.installed && status.latestVersion && (
          <div className="flex items-center justify-between py-3 border-b">
            <span className="text-sm text-muted-foreground">{t('install.latestVersion') || 'Latest Version'}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono">{status.latestVersion}</span>
              {status.updateAvailable && (
                <Badge variant="outline" className="text-orange-600 border-orange-500/50">
                  {t('install.updateAvailable') || 'Update Available'}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Installation Path */}
        {status.path && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">{t('install.path') || 'Path'}</span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{formatPath(status.path)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
