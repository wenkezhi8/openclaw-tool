'use client';

import { useState } from 'react';
import { useInstallStatus, useInstallActions } from '@/hooks';
import { Loader2 } from 'lucide-react';
import {
  InstallStatusCard,
  InstallActionsCard,
  InstallProgressCard,
  InstallSteps,
} from '@/components/install';
import type { InstallStep } from '@/types/install';
import { useI18n } from '@/hooks';

export default function InstallPage() {
  const { t } = useI18n();
  const { data: status, isLoading } = useInstallStatus();
  const { install, update, uninstall, isInstalling, isUpdating, isUninstalling } = useInstallActions();

  // Progress tracking state
  const [completedSteps, setCompletedSteps] = useState<InstallStep[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  // Simulate progress for demo purposes
  // In production, this would come from WebSocket or API
  const handleInstall = () => {
    setShowProgress(true);
    install();
  };

  // Demo progress - in production, this would be driven by WebSocket/API
  const demoProgress = {
    step: 'checking' as InstallStep,
    percentage: 0,
    message: '',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('install.title') || 'Installation'}</h1>
        <p className="text-muted-foreground">
          {t('install.subtitle') || 'Manage OpenClaw CLI installation'}
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Progress Card (shown during installation) */}
        {showProgress && (
          <>
            <InstallProgressCard
              progress={demoProgress}
              onRetry={() => {
                setShowProgress(false);
                handleInstall();
              }}
              onRollback={() => {
                setShowProgress(false);
                setCompletedSteps([]);
              }}
            />
            <InstallSteps
              currentStep={demoProgress.step}
              completedSteps={completedSteps}
            />
          </>
        )}

        {/* Status Card */}
        <InstallStatusCard
          status={status!}
        />

        {/* Actions Card */}
        <InstallActionsCard
          status={status!}
          isInstalling={isInstalling}
          isUpdating={isUpdating}
          isUninstalling={isUninstalling}
          onInstall={handleInstall}
          onUpdate={update}
          onUninstall={uninstall}
        />
      </div>
    </div>
  );
}
