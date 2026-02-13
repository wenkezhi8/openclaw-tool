'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Monitor, Trash2, ExternalLink, Clock } from 'lucide-react';
import type { BrowserSessionInfo, BrowserSessionStatus } from '@/types/browser';

interface BrowserSessionCardProps {
  session: BrowserSessionInfo;
  isActive?: boolean;
  onSelect?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}

function getStatusColor(status: BrowserSessionStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'idle':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'error':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'closed':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

export function BrowserSessionCard({
  session,
  isActive = false,
  onSelect,
  onClose,
  isLoading = false,
}: BrowserSessionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        isActive ? 'border-primary ring-1 ring-primary/20' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="font-mono text-xs">{session.id.slice(0, 8)}</span>
          </CardTitle>
          <Badge variant="outline" className={getStatusColor(session.status)}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Page */}
        {session.currentPage && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate" title={session.currentPage}>
              {session.currentPage}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(session.lastActivity)}
          </div>
          <div>{session.pageCount} page(s)</div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Close Browser Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to close this browser session? All pages will be closed and
                  data will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose?.();
                    setShowDeleteDialog(false);
                  }}
                >
                  Close Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
