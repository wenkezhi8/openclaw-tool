'use client';

import { useState } from 'react';
import { useFileList, useFilesystemActions, useFilesystemConfig } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Folder,
  File,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Home,
  FolderPlus,
  Trash2,
  Edit,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import type { FileInfo, FileType } from '@/types/filesystem';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

const FileIcon = ({ type, name }: { type: FileType; name: string }) => {
  if (type === 'directory') {
    return <Folder className="h-4 w-4 text-yellow-500" />;
  }

  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md':
      return <File className="h-4 w-4 text-blue-500" />;
    case 'json':
      return <File className="h-4 w-4 text-green-500" />;
    case 'ts':
    case 'tsx':
      return <File className="h-4 w-4 text-blue-600" />;
    case 'js':
    case 'jsx':
      return <File className="h-4 w-4 text-yellow-400" />;
    default:
      return <File className="h-4 w-4 text-gray-500" />;
  }
};

interface FileExplorerProps {
  onSelectFile: (file: FileInfo) => void;
  selectedPath: string | null;
}

export function FileExplorer({ onSelectFile, selectedPath }: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState(process.cwd());
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const { data, isLoading, refetch } = useFileList(currentPath);
  const { createDirectory, deleteFile, isCreatingDir, isDeleting } = useFilesystemActions();
  const { data: config } = useFilesystemConfig();

  const handleNavigate = (file: FileInfo) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    } else {
      onSelectFile(file);
    }
  };

  const handleGoUp = () => {
    if (data?.parentPath) {
      setCurrentPath(data.parentPath);
    }
  };

  const handleGoHome = () => {
    if (config?.allowedPaths && config.allowedPaths.length > 0) {
      setCurrentPath(config.allowedPaths[0]);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    createDirectory(
      {
        path: `${currentPath}/${newFolderName}`,
        recursive: false,
      },
      {
        onSuccess: () => {
          setNewFolderName('');
          setShowNewFolder(false);
          refetch();
        },
      }
    );
  };

  const handleDelete = (file: FileInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${file.name}?`)) {
      deleteFile(file.path, {
        onSuccess: () => {
          refetch();
          if (selectedPath === file.path) {
            onSelectFile(null as unknown as FileInfo);
          }
        },
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Folder className="h-4 w-4" />
            File Explorer
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowNewFolder(!showNewFolder)}>
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Path breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="icon" onClick={handleGoHome} title="Home">
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoUp}
            disabled={!data?.parentPath}
            title="Go up"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground truncate flex-1" title={currentPath}>
            {currentPath}
          </span>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex gap-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="flex-1"
            />
            <Button size="sm" onClick={handleCreateFolder} disabled={isCreatingDir}>
              Create
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : !data ? (
          <div className="p-4 text-center text-muted-foreground">Failed to load files</div>
        ) : data && data.files.length > 0 ? (
          <div className="divide-y">
            {data.files.map((file) => (
              <div
                key={file.path}
                className={`flex items-center justify-between p-2 hover:bg-accent cursor-pointer ${
                  selectedPath === file.path ? 'bg-accent' : ''
                }`}
                onClick={() => handleNavigate(file)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon type={file.type} name={file.name} />
                  <span className="truncate">{file.name}</span>
                  {file.type === 'directory' && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {file.type === 'file' && <span>{formatBytes(file.size)}</span>}
                  <span>{formatDate(file.modifiedAt)}</span>
                  {!config?.readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(file, e)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Empty directory</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
