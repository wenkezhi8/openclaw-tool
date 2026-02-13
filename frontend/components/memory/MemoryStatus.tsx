'use client';

import { useMemoryStatus, useMemoryActions } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, HardDrive, FileText, Clock, Download, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}

export function MemoryStatus() {
  const { data, isLoading, refetch } = useMemoryStatus();
  const { backupMemory, isBackingUp } = useMemoryActions();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load memory status
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Memory Status</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => backupMemory()}
            disabled={isBackingUp}
          >
            <Download className="h-4 w-4 mr-2" />
            {isBackingUp ? 'Backing up...' : 'Backup'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">SOUL Config</p>
              <p className="text-sm font-medium">
                {data.soulExists ? (
                  <span className="text-green-500">Active</span>
                ) : (
                  <span className="text-yellow-500">Not Found</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Memory Files</p>
              <p className="text-sm font-medium">{data.userMemoryFiles.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Size</p>
              <p className="text-sm font-medium">{formatBytes(data.totalSize)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="text-sm font-medium">{formatDate(data.lastBackup)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>SOUL Path: {data.soulPath}</p>
          <p>User Memory: {data.userMemoryPath}</p>
        </div>
      </CardContent>
    </Card>
  );
}
