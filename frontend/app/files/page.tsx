'use client';

import { useState } from 'react';
import { useI18n, useFilesystemConfig } from '@/hooks';
import { FileExplorer } from '@/components/files/FileExplorer';
import { FileEditor } from '@/components/files/FileEditor';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen, Shield, AlertTriangle } from 'lucide-react';
import type { FileInfo } from '@/types/filesystem';

export default function FilesPage() {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const { data: config } = useFilesystemConfig();

  const pageTexts = {
    title: t('files.title') || 'File System',
    description: t('files.description') || 'Browse and manage files in a sandboxed environment',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            {pageTexts.title}
          </h1>
          <p className="text-muted-foreground">{pageTexts.description}</p>
        </div>
      </div>

      {/* Sandbox Warning */}
      {config?.readOnly && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-2 py-3">
            <Shield className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-500">
              File system is in read-only mode. You can view files but cannot make changes.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Allowed Paths Info */}
      {config && (
        <Card>
          <CardContent className="flex items-center gap-2 py-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Allowed paths: {config.allowedPaths.join(', ')}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* File Explorer */}
        <div className="min-h-[600px]">
          <FileExplorer
            onSelectFile={setSelectedFile}
            selectedPath={selectedFile?.path || null}
          />
        </div>

        {/* File Editor */}
        <div className="min-h-[600px]">
          <FileEditor file={selectedFile} onClose={() => setSelectedFile(null)} />
        </div>
      </div>
    </div>
  );
}
