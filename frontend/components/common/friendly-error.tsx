'use client';

import { AlertTriangle, RefreshCw, Server, Wifi, Shield, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getFriendlyError,
  getErrorCode,
  type FriendlyErrorInfo,
} from '@/lib/error-messages';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface FriendlyErrorProps {
  error: unknown;
  onRetry?: () => void;
  onStartBackend?: () => void;
  onCheckNetwork?: () => void;
  onRefreshToken?: () => void;
  className?: string;
  showCauses?: boolean;
  showSolutions?: boolean;
  compact?: boolean;
}

const autoFixIcons = {
  startBackend: Server,
  checkNetwork: Wifi,
  refreshToken: Shield,
  retry: RefreshCw,
} as const;

const autoFixLabels = {
  startBackend: { en: 'Start Backend', zh: '启动后端' },
  checkNetwork: { en: 'Check Network', zh: '检查网络' },
  refreshToken: { en: 'Re-authenticate', zh: '重新认证' },
  retry: { en: 'Retry', zh: '重试' },
} as const;

export function FriendlyError({
  error,
  onRetry,
  onStartBackend,
  onCheckNetwork,
  onRefreshToken,
  className,
  showCauses = true,
  showSolutions = true,
  compact = false,
}: FriendlyErrorProps) {
  const { t, locale } = useI18n();
  const friendlyError = getFriendlyError(error);
  const errorCode = getErrorCode(error);

  // Get localized title and message
  const getTitle = () => {
    const key = friendlyError.titleKey;
    const localized = t(key);
    return localized !== key ? localized : friendlyError.title;
  };

  const getMessage = () => {
    const key = friendlyError.messageKey;
    const localized = t(key);
    return localized !== key ? localized : friendlyError.message;
  };

  // Get auto-fix handler
  const getAutoFixHandler = () => {
    switch (friendlyError.autoFixAction) {
      case 'startBackend':
        return onStartBackend;
      case 'checkNetwork':
        return onCheckNetwork;
      case 'refreshToken':
        return onRefreshToken;
      case 'retry':
        return onRetry;
      default:
        return onRetry;
    }
  };

  // Get localized causes and solutions from i18n
  const getCauses = (): string[] => {
    const causesKey = `errors.${getErrorI18nKey(errorCode)}.causes`;
    // Try to get localized causes from i18n
    const causes: string[] = [];
    for (let i = 0; i < friendlyError.causes.length; i++) {
      const key = `${causesKey}.${i}`;
      const localized = t(key);
      if (localized !== key) {
        causes.push(localized);
      } else {
        causes.push(friendlyError.causes[i]);
      }
    }
    return causes;
  };

  const getSolutions = (): string[] => {
    const solutionsKey = `errors.${getErrorI18nKey(errorCode)}.solutions`;
    const solutions: string[] = [];
    for (let i = 0; i < friendlyError.solutions.length; i++) {
      const key = `${solutionsKey}.${i}`;
      const localized = t(key);
      if (localized !== key) {
        solutions.push(localized);
      } else {
        solutions.push(friendlyError.solutions[i]);
      }
    }
    return solutions;
  };

  const autoFixHandler = friendlyError.canAutoFix ? getAutoFixHandler() : undefined;
  const AutoFixIcon = friendlyError.autoFixAction
    ? autoFixIcons[friendlyError.autoFixAction]
    : RefreshCw;

  const autoFixLabel = friendlyError.autoFixAction
    ? autoFixLabels[friendlyError.autoFixAction][locale === 'zh-CN' ? 'zh' : 'en']
    : t('common.retry');

  if (compact) {
    return (
      <Card className={cn('border-destructive/50', className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-destructive">{getTitle()}</h4>
                <Badge variant="outline" className="text-xs">
                  {errorCode}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{getMessage()}</p>
              {autoFixHandler && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={autoFixHandler}
                  className="mt-3"
                >
                  <AutoFixIcon className="h-4 w-4 mr-2" />
                  {autoFixLabel}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-destructive/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              {getTitle()}
              <Badge variant="outline" className="font-normal">
                {errorCode}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{getMessage()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCauses && friendlyError.causes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {t('errors.possibleCauses')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {getCauses().map((cause, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">-</span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showSolutions && friendlyError.solutions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              {t('errors.suggestedSolutions')}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {getSolutions().map((solution, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">{index + 1}.</span>
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        )}

        {autoFixHandler && (
          <div className="flex gap-2 pt-2">
            <Button onClick={autoFixHandler} className="gap-2">
              <AutoFixIcon className="h-4 w-4" />
              {autoFixLabel}
            </Button>
            {onRetry && friendlyError.autoFixAction !== 'retry' && (
              <Button variant="outline" onClick={onRetry}>
                {t('common.retry')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to get i18n key for error
function getErrorI18nKey(code: string): string {
  const keyMap: Record<string, string> = {
    NETWORK_ERROR: 'network',
    ECONNREFUSED: 'connectionRefused',
    ENOTFOUND: 'notFound',
    ETIMEDOUT: 'timeout',
    UNAUTHORIZED: 'unauthorized',
    FORBIDDEN: 'forbidden',
    NOT_FOUND: 'resourceNotFound',
    INTERNAL_ERROR: 'serverError',
    SERVICE_UNAVAILABLE: 'serviceUnavailable',
    VALIDATION_ERROR: 'validation',
    UNKNOWN_ERROR: 'unknown',
  };
  return keyMap[code] || 'unknown';
}

// Re-export types for convenience
export type { FriendlyErrorInfo };
