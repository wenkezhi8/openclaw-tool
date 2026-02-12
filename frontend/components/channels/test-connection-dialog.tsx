'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import type { Channel, ConnectionTestResult } from '@/types/channel';
import { cn } from '@/lib/utils';

interface TestConnectionDialogProps {
  channel: Channel | null;
  open: boolean;
  onClose: () => void;
  onTest: (channel: Channel) => Promise<ConnectionTestResult>;
  // Text props for i18n
  text?: {
    title?: string;
    description?: string;
    testing?: string;
    success?: string;
    error?: string;
    latency?: string;
    close?: string;
    retry?: string;
  };
}

type TestState = 'idle' | 'testing' | 'success' | 'error';

export function TestConnectionDialog({
  channel,
  open,
  onClose,
  onTest,
  text
}: TestConnectionDialogProps) {
  const [testState, setTestState] = useState<TestState>('idle');
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const runTest = useCallback(async () => {
    if (!channel) return;

    setTestState('testing');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const testResult = await onTest(channel);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(testResult);
      setTestState(testResult.success ? 'success' : 'error');
    } catch (error) {
      clearInterval(progressInterval);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      });
      setTestState('error');
    }
  }, [channel, onTest]);

  useEffect(() => {
    if (open && channel) {
      runTest();
    } else {
      setTestState('idle');
      setResult(null);
      setProgress(0);
    }
  }, [open, channel, runTest]);

  const getStatusIcon = () => {
    switch (testState) {
      case 'testing':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      testing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const labels = {
      testing: text?.testing || 'Testing...',
      success: text?.success || 'Connected',
      error: text?.error || 'Failed',
    };

    if (testState === 'idle') return null;

    return (
      <Badge className={cn(variants[testState])}>
        {labels[testState]}
      </Badge>
    );
  };

  const t = text;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t?.title || 'Test Connection'}</DialogTitle>
          <DialogDescription>
            {t?.description || 'Testing connection to your AI provider channel.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {getStatusIcon()}
          {getStatusBadge()}

          {testState === 'testing' && (
            <div className="w-full max-w-xs">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Testing connection... {progress}%
              </p>
            </div>
          )}

          {result && testState !== 'testing' && (
            <div className="w-full space-y-3 mt-4">
              <div className={cn(
                'rounded-lg border p-4',
                result.success
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                  : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
              )}>
                <p className="text-sm font-medium">
                  {result.success ? 'Connection successful!' : 'Connection failed'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.message}
                </p>
              </div>

              {result.latency && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t?.latency || 'Latency'}:
                  </span>
                  <span className="font-mono font-medium">
                    {result.latency}ms
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tested at:</span>
                <span className="font-mono">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {testState !== 'testing' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={runTest}
              >
                {t?.retry || 'Retry'}
              </Button>
              <Button type="button" onClick={onClose}>
                {t?.close || 'Close'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
