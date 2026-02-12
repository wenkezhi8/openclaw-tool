'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === 'destructive' && (
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="ml-9">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Preset dialogs for Gateway actions
interface GatewayConfirmDialogsProps {
  openType: 'start' | 'stop' | 'restart' | null;
  onOpenChange: (type: 'start' | 'stop' | 'restart' | null) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  texts: {
    startTitle: string;
    startDescription: string;
    stopTitle: string;
    stopDescription: string;
    restartTitle: string;
    restartDescription: string;
    confirm: string;
    cancel: string;
  };
}

export function GatewayConfirmDialogs({
  openType,
  onOpenChange,
  onConfirm,
  isLoading = false,
  texts,
}: GatewayConfirmDialogsProps) {
  const getDialogProps = () => {
    switch (openType) {
      case 'start':
        return {
          title: texts.startTitle,
          description: texts.startDescription,
          variant: 'default' as const,
        };
      case 'stop':
        return {
          title: texts.stopTitle,
          description: texts.stopDescription,
          variant: 'destructive' as const,
        };
      case 'restart':
        return {
          title: texts.restartTitle,
          description: texts.restartDescription,
          variant: 'destructive' as const,
        };
      default:
        return null;
    }
  };

  const props = getDialogProps();

  if (!props) return null;

  return (
    <ConfirmDialog
      open={openType !== null}
      onOpenChange={(open) => onOpenChange(open ? openType! : null)}
      title={props.title}
      description={props.description}
      confirmLabel={texts.confirm}
      cancelLabel={texts.cancel}
      variant={props.variant}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
