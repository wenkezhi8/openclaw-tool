'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InstallStep } from '@/types/install';
import { useI18n } from '@/hooks';

interface InstallStepItem {
  key: InstallStep;
  label: string;
  description: string;
}

const installSteps: InstallStepItem[] = [
  {
    key: 'checking',
    label: 'Checking System',
    description: 'Verifying system requirements and dependencies',
  },
  {
    key: 'downloading',
    label: 'Downloading',
    description: 'Downloading OpenClaw CLI package',
  },
  {
    key: 'installing',
    label: 'Installing',
    description: 'Installing OpenClaw CLI to system',
  },
  {
    key: 'verifying',
    label: 'Verifying',
    description: 'Verifying installation integrity',
  },
  {
    key: 'configuring',
    label: 'Configuring',
    description: 'Configuring environment variables',
  },
  {
    key: 'complete',
    label: 'Complete',
    description: 'Installation completed successfully',
  },
];

interface InstallStepsProps {
  currentStep: InstallStep;
  completedSteps: InstallStep[];
  failedStep?: InstallStep;
}

export function InstallSteps({ currentStep, completedSteps, failedStep }: InstallStepsProps) {
  const { t } = useI18n();

  const getStepStatus = (step: InstallStep): 'completed' | 'current' | 'pending' | 'failed' => {
    if (failedStep === step) return 'failed';
    if (completedSteps.includes(step)) return 'completed';
    if (currentStep === step) return 'current';
    return 'pending';
  };

  const visibleSteps = installSteps;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-0">
          {visibleSteps.map((step, index) => {
            const status = getStepStatus(step.key);
            const isLast = index === visibleSteps.length - 1;

            return (
              <div key={step.key} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-4 top-8 w-0.5 h-full -ml-px',
                      status === 'completed' ? 'bg-green-500' : 'bg-border'
                    )}
                  />
                )}

                {/* Step Item */}
                <div className="flex gap-4 pb-8 last:pb-0">
                  {/* Icon */}
                  <div className="relative z-10">
                    {status === 'completed' && (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {status === 'current' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    {status === 'failed' && (
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-red-700" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div
                      className={cn(
                        'font-medium',
                        status === 'current' && 'text-blue-600 dark:text-blue-400',
                        status === 'completed' && 'text-green-600 dark:text-green-400',
                        status === 'failed' && 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {t(`install.steps.${step.key}`) || step.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {t(`install.steps.${step.key}Description`) || step.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
