'use client';

import { useState } from 'react';
import { useInstallStatus, useInstallActions } from '@/hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  InstallStatusCard,
  InstallActionsCard,
  InstallProgressCard,
  InstallSteps,
  InstallTerminal,
} from '@/components/install';
import type { InstallStep, InstallStatus } from '@/types/install';
import { useI18n } from '@/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InstallPage() {
  const { t } = useI18n();
  const { data: status, isLoading, error } = useInstallStatus();
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

  // Default status for when API is unavailable
  // Note: This is only used if status is null/undefined
  // The hook now has local fallback, so this should rarely be used
  const defaultStatus: InstallStatus = {
    installed: false,
    version: undefined,
    latestVersion: undefined,
    updateAvailable: false,
    path: undefined,
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

  // Use actual status or default
  const displayStatus = status || defaultStatus;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('install.title') || 'Installation'}</h1>
        <p className="text-muted-foreground">
          {t('install.subtitle') || 'Manage OpenClaw CLI installation'}
        </p>
      </div>

      {/* Error alert if backend is unavailable */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('install.backendError') || 'Cannot connect to backend server. Please ensure the backend is running.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Two-column layout: Settings on left, Terminal on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Installation Controls */}
        <div className="space-y-6">
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
            status={displayStatus}
          />

          {/* Actions Card */}
          <InstallActionsCard
            status={displayStatus}
            isInstalling={isInstalling}
            isUpdating={isUpdating}
            isUninstalling={isUninstalling}
            onInstall={handleInstall}
            onUpdate={update}
            onUninstall={uninstall}
          />
        </div>

        {/* Right Column - Terminal */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <InstallTerminal className="h-[500px]" />
        </div>
      </div>
    </div>
  );
}
