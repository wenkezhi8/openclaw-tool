'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

// Terminal log entry type
interface TerminalLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  operation: 'install' | 'update' | 'uninstall';
}

export default function InstallPage() {
  const { t } = useI18n();
  const { data: status, isLoading, error } = useInstallStatus();
  const { install, update, uninstall, isInstalling, isUpdating, isUninstalling } = useInstallActions();

  // Progress tracking state
  const [completedSteps, setCompletedSteps] = useState<InstallStep[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  // Terminal logs state for simulating installation output
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearTimeout(simulationRef.current);
      }
    };
  }, []);

  // Simulate installation logs
  const simulateInstallation = useCallback(() => {
    const logs: Omit<TerminalLog, 'timestamp'>[] = [
      { level: 'info', message: 'Starting OpenClaw CLI installation...', operation: 'install' },
      { level: 'info', message: 'Checking system requirements...', operation: 'install' },
      { level: 'debug', message: 'OS: macOS Darwin 25.3.0', operation: 'install' },
      { level: 'debug', message: 'Architecture: arm64', operation: 'install' },
      { level: 'info', message: 'Downloading OpenClaw CLI package...', operation: 'install' },
      { level: 'info', message: 'Fetching latest release from GitHub...', operation: 'install' },
      { level: 'debug', message: 'Release version: v1.0.0', operation: 'install' },
      { level: 'info', message: 'Download completed: openclaw-darwin-arm64.tar.gz', operation: 'install' },
      { level: 'info', message: 'Verifying checksum...', operation: 'install' },
      { level: 'debug', message: 'Expected: sha256:a1b2c3d4...', operation: 'install' },
      { level: 'debug', message: 'Actual: sha256:a1b2c3d4...', operation: 'install' },
      { level: 'info', message: 'Checksum verification passed', operation: 'install' },
      { level: 'info', message: 'Extracting package...', operation: 'install' },
      { level: 'info', message: 'Installing binary to /usr/local/bin/openclaw...', operation: 'install' },
      { level: 'warn', message: 'Sudo may be required for system-wide installation', operation: 'install' },
      { level: 'info', message: 'Setting executable permissions...', operation: 'install' },
      { level: 'info', message: 'Configuring environment...', operation: 'install' },
      { level: 'debug', message: 'Creating config directory: ~/.openclaw', operation: 'install' },
      { level: 'info', message: 'Installation completed successfully!', operation: 'install' },
      { level: 'info', message: 'Run "openclaw --version" to verify installation', operation: 'install' },
    ];

    setIsSimulating(true);
    let index = 0;

    const addLog = () => {
      if (index < logs.length) {
        setTerminalLogs(prev => [...prev, {
          ...logs[index],
          timestamp: new Date().toISOString(),
        }]);
        // Update completed steps based on progress
        const progress = index / logs.length;
        if (progress >= 0.2 && progress < 0.4) {
          setCompletedSteps(['checking']);
        } else if (progress >= 0.4 && progress < 0.6) {
          setCompletedSteps(['checking', 'downloading']);
        } else if (progress >= 0.6 && progress < 0.8) {
          setCompletedSteps(['checking', 'downloading', 'extracting']);
        } else if (progress >= 0.8) {
          setCompletedSteps(['checking', 'downloading', 'extracting', 'configuring']);
        }
        index++;
        simulationRef.current = setTimeout(addLog, 300 + Math.random() * 500);
      } else {
        setIsSimulating(false);
        setCompletedSteps(['checking', 'downloading', 'extracting', 'configuring', 'complete']);
      }
    };

    addLog();
  }, []);

  // Simulate update logs
  const simulateUpdate = useCallback(() => {
    const logs: Omit<TerminalLog, 'timestamp'>[] = [
      { level: 'info', message: 'Checking for updates...', operation: 'update' },
      { level: 'info', message: 'Current version: v1.0.0', operation: 'update' },
      { level: 'info', message: 'Latest version: v1.1.0', operation: 'update' },
      { level: 'info', message: 'Update available!', operation: 'update' },
      { level: 'info', message: 'Downloading update package...', operation: 'update' },
      { level: 'info', message: 'Update downloaded successfully', operation: 'update' },
      { level: 'info', message: 'Applying update...', operation: 'update' },
      { level: 'info', message: 'Update completed successfully!', operation: 'update' },
    ];

    setIsSimulating(true);
    let index = 0;

    const addLog = () => {
      if (index < logs.length) {
        setTerminalLogs(prev => [...prev, {
          ...logs[index],
          timestamp: new Date().toISOString(),
        }]);
        index++;
        simulationRef.current = setTimeout(addLog, 400 + Math.random() * 400);
      } else {
        setIsSimulating(false);
      }
    };

    addLog();
  }, []);

  // Simulate uninstall logs
  const simulateUninstall = useCallback(() => {
    const logs: Omit<TerminalLog, 'timestamp'>[] = [
      { level: 'warn', message: 'Starting uninstallation...', operation: 'uninstall' },
      { level: 'info', message: 'Stopping running processes...', operation: 'uninstall' },
      { level: 'info', message: 'Removing binary from /usr/local/bin/openclaw...', operation: 'uninstall' },
      { level: 'info', message: 'Removing config directory ~/.openclaw...', operation: 'uninstall' },
      { level: 'info', message: 'Cleaning up temporary files...', operation: 'uninstall' },
      { level: 'info', message: 'Uninstallation completed successfully', operation: 'uninstall' },
    ];

    setIsSimulating(true);
    let index = 0;

    const addLog = () => {
      if (index < logs.length) {
        setTerminalLogs(prev => [...prev, {
          ...logs[index],
          timestamp: new Date().toISOString(),
        }]);
        index++;
        simulationRef.current = setTimeout(addLog, 400 + Math.random() * 300);
      } else {
        setIsSimulating(false);
        setCompletedSteps([]);
      }
    };

    addLog();
  }, []);

  // Simulate progress for demo purposes
  // In production, this would come from WebSocket or API
  const handleInstall = () => {
    setShowProgress(true);
    setCompletedSteps([]);
    setTerminalLogs([]);
    simulateInstallation();
    install();
  };

  const handleUpdate = () => {
    setTerminalLogs([]);
    simulateUpdate();
    update();
  };

  const handleUninstall = () => {
    setTerminalLogs([]);
    simulateUninstall();
    uninstall();
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
            isInstalling={isInstalling || isSimulating}
            isUpdating={isUpdating}
            isUninstalling={isUninstalling}
            onInstall={handleInstall}
            onUpdate={handleUpdate}
            onUninstall={handleUninstall}
          />
        </div>

        {/* Right Column - Terminal */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <InstallTerminal
            className="h-[500px]"
            simulatedLogs={terminalLogs}
          />
        </div>
      </div>
    </div>
  );
}
