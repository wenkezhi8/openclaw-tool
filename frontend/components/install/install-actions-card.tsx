'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import type { InstallStatus } from '@/types/install';
import { useI18n } from '@/hooks';

interface InstallActionsCardProps {
  status: InstallStatus;
  isInstalling: boolean;
  isUpdating: boolean;
  isUninstalling: boolean;
  onInstall: () => void;
  onUpdate: () => void;
  onUninstall: () => void;
}

export function InstallActionsCard({
  status,
  isInstalling,
  isUpdating,
  isUninstalling,
  onInstall,
  onUpdate,
  onUninstall,
}: InstallActionsCardProps) {
  const { t } = useI18n();

  const handleUninstallClick = () => {
    if (confirm(t('install.confirmUninstall') || 'Are you sure you want to uninstall OpenClaw CLI? This action cannot be undone.')) {
      onUninstall();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('install.actions') || 'Actions'}</CardTitle>
        <CardDescription>
          {t('install.actionsDescription') || 'Install, update, or remove OpenClaw CLI'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {!status.installed ? (
          <Button onClick={onInstall} disabled={isInstalling} size="lg" className="min-w-[180px]">
            {isInstalling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('install.steps.installing') || 'Installing...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t('install.startNow') || 'Install OpenClaw'}
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={onUpdate}
              disabled={isUpdating || !status.updateAvailable}
              variant="outline"
              className="min-w-[160px]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('install.steps.updating') || 'Updating...'}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {status.updateAvailable
                    ? t('install.updateNow') || 'Update Now'
                    : t('install.upToDate') || 'Up to Date'}
                </>
              )}
            </Button>
            <Button
              onClick={handleUninstallClick}
              disabled={isUninstalling}
              variant="destructive"
              className="min-w-[140px]"
            >
              {isUninstalling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('install.steps.uninstalling') || 'Uninstalling...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('install.uninstall') || 'Uninstall'}
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
