'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InstallProgress, InstallStep } from '@/types/install';
import { useI18n } from '@/hooks';

interface InstallProgressCardProps {
  progress: InstallProgress;
  onRetry?: () => void;
  onRollback?: () => void;
}

const stepIcons: Record<InstallStep, React.ReactNode> = {
  checking: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  downloading: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  installing: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  verifying: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  configuring: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  complete: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  failed: <XCircle className="h-5 w-5 text-red-500" />,
};

const stepColors: Record<InstallStep, string> = {
  checking: 'text-blue-600 dark:text-blue-400',
  downloading: 'text-blue-600 dark:text-blue-400',
  installing: 'text-blue-600 dark:text-blue-400',
  verifying: 'text-blue-600 dark:text-blue-400',
  configuring: 'text-blue-600 dark:text-blue-400',
  complete: 'text-green-600 dark:text-green-400',
  failed: 'text-red-600 dark:text-red-400',
};

const stepBgColors: Record<InstallStep, string> = {
  checking: 'bg-blue-500/10 border-blue-500/20',
  downloading: 'bg-blue-500/10 border-blue-500/20',
  installing: 'bg-blue-500/10 border-blue-500/20',
  verifying: 'bg-blue-500/10 border-blue-500/20',
  configuring: 'bg-blue-500/10 border-blue-500/20',
  complete: 'bg-green-500/10 border-green-500/20',
  failed: 'bg-red-500/10 border-red-500/20',
};

export const InstallProgressCard = memo(function InstallProgressCard({
  progress,
  onRetry,
  onRollback,
}: InstallProgressCardProps) {
  const { t } = useI18n();

  const getStepLabel = (step: InstallStep): string => {
    return t(`install.steps.${step}`) || step;
  };

  const isFailed = progress.step === 'failed';
  const isComplete = progress.step === 'complete';
  const inProgress = !isFailed && !isComplete;

  return (
    <Card className={cn('border-2', stepBgColors[progress.step])}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepIcons[progress.step]}
            <span className={cn('text-lg font-semibold', stepColors[progress.step])}>
              {isFailed
                ? t('install.failed') || 'Installation Failed'
                : isComplete
                ? t('install.complete') || 'Installation Complete'
                : t('install.progress') || 'Installation in Progress'}
            </span>
          </div>
          {inProgress && (
            <Badge variant="outline" className="text-sm">
              {progress.percentage}%
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Step */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {t('install.progressDetail.currentStep') || 'Current Step'}
          </div>
          <div className={cn('text-lg font-medium', stepColors[progress.step])}>
            {getStepLabel(progress.step)}
          </div>
        </div>

        {/* Progress Bar */}
        {inProgress && (
          <div className="space-y-2">
            <Progress value={progress.percentage} className="h-2" />
            <div className="text-sm text-muted-foreground">{progress.message}</div>
          </div>
        )}

        {/* Error Message */}
        {isFailed && progress.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-red-600 dark:text-red-400">
                  {t('messages.errorOccurred') || 'An error occurred'}
                </div>
                <div className="text-sm text-red-500/80 mt-1">{progress.error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        {progress.details && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {progress.details.bytesDownloaded !== undefined && progress.details.totalBytes && (
              <div>
                <span className="text-muted-foreground">
                  {t('install.progressDetail.bytesDownloaded') || 'Downloaded'}:{' '}
                </span>
                <span className="font-medium">
                  {progress.details.bytesDownloaded} / {progress.details.totalBytes} bytes
                </span>
              </div>
            )}
            {progress.details.downloadSpeed && (
              <div>
                <span className="text-muted-foreground">
                  {t('install.progressDetail.downloadSpeed') || 'Download speed'}:{' '}
                </span>
                <span className="font-medium">{progress.details.downloadSpeed}</span>
              </div>
            )}
            {progress.details.estimatedTime !== undefined && (
              <div>
                <span className="text-muted-foreground">
                  {t('install.progressDetail.estimatedTime') || 'Estimated time'}:{' '}
                </span>
                <span className="font-medium">{progress.details.estimatedTime}s</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isFailed && (
          <div className="flex gap-3">
            {progress.canRetry && onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('install.errors.retry') || 'Retry'}
              </Button>
            )}
            {progress.canRollback && onRollback && (
              <Button onClick={onRollback} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('install.errors.rollback') || 'Rollback'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
