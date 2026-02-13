'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCw, Loader2, Keyboard } from 'lucide-react';
import type { GatewayStatus } from '@/types/gateway';
import { GatewayConfirmDialogs } from './confirm-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks';

export interface GatewayControlButtonsProps {
  status: GatewayStatus | undefined;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onRefresh?: () => void;
  disabled?: boolean;
}

export function GatewayControlButtons({
  status,
  isLoading,
  onStart,
  onStop,
  onRestart,
  onRefresh,
  disabled = false,
}: GatewayControlButtonsProps) {
  const { t } = useI18n();
  const [confirmDialog, setConfirmDialog] = useState<'start' | 'stop' | 'restart' | null>(null);

  const handleAction = (action: 'start' | 'stop' | 'restart') => {
    setConfirmDialog(action);
  };

  const handleConfirm = () => {
    switch (confirmDialog) {
      case 'start':
        onStart();
        break;
      case 'stop':
        onStop();
        break;
      case 'restart':
        onRestart();
        break;
    }
    setConfirmDialog(null);
  };

  const isRunning = status === 'running';

  const getActionButtonLabel = (action: 'start' | 'stop' | 'restart') => {
    if (isLoading && confirmDialog === action) {
      switch (action) {
        case 'start':
          return t('gateway.actions.starting');
        case 'stop':
          return t('gateway.actions.stopping');
        case 'restart':
          return t('gateway.actions.restarting');
      }
    }
    switch (action) {
      case 'start':
        return t('gateway.start');
      case 'stop':
        return t('gateway.stop');
      case 'restart':
        return t('gateway.restart');
    }
  };

  const getActionIcon = (action: 'start' | 'stop' | 'restart') => {
    if (isLoading && confirmDialog === action) {
      return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
    }
    switch (action) {
      case 'start':
        return <Play className="h-4 w-4 mr-2" />;
      case 'stop':
        return <Square className="h-4 w-4 mr-2" />;
      case 'restart':
        return <RotateCw className="h-4 w-4 mr-2" />;
    }
  };

  const shortcuts = {
    title: t('gateway.shortcuts.title'),
    refresh: 'R',
    start: 'S',
    stop: 'X',
    restart: 'Shift+R',
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!isRunning ? (
          <Button
            onClick={() => handleAction('start')}
            disabled={isLoading || disabled}
            variant="default"
            size="sm"
          >
            {getActionIcon('start')}
            {getActionButtonLabel('start')}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleAction('restart')}
              disabled={isLoading || disabled}
              variant="outline"
              size="sm"
            >
              {getActionIcon('restart')}
              {getActionButtonLabel('restart')}
            </Button>
            <Button
              onClick={() => handleAction('stop')}
              disabled={isLoading || disabled}
              variant="destructive"
              size="sm"
            >
              {getActionIcon('stop')}
              {getActionButtonLabel('stop')}
            </Button>
          </>
        )}

        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            {t('gateway.actions.refresh')}
          </Button>
        )}

        <ShortcutDropdown shortcuts={shortcuts} />
      </div>

      <GatewayConfirmDialogs
        openType={confirmDialog}
        onOpenChange={setConfirmDialog}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        texts={{
          startTitle: t('gateway.confirmations.start'),
          startDescription: t('gateway.confirmations.start'),
          stopTitle: t('gateway.confirmations.stop'),
          stopDescription: t('gateway.confirmations.stop'),
          restartTitle: t('gateway.confirmations.restart'),
          restartDescription: t('gateway.confirmations.restart'),
          confirm: t('common.confirm'),
          cancel: t('common.cancel'),
        }}
      />
    </>
  );
}

interface ShortcutDropdownProps {
  shortcuts: {
    title: string;
    refresh: string;
    start: string;
    stop: string;
    restart: string;
  };
}

function ShortcutDropdown({ shortcuts }: ShortcutDropdownProps) {
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">{shortcuts.title}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Keyboard className="h-4 w-4" />
          {shortcuts.title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between">
          <span>{t('gateway.actions.refresh')}</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
            {shortcuts.refresh}
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between">
          <span>{t('gateway.start')}</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
            {shortcuts.start}
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between">
          <span>{t('gateway.stop')}</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
            {shortcuts.stop}
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between">
          <span>{t('gateway.restart')}</span>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
            {shortcuts.restart}
          </kbd>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
