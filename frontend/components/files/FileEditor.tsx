'use client';

import { useState, useEffect } from 'react';
import { useFileContent, useFilesystemActions, useFilesystemConfig } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Save, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import type { FileInfo } from '@/types/filesystem';

interface FileEditorProps {
  file: FileInfo | null;
  onClose: () => void;
}

export function FileEditor({ file, onClose }: FileEditorProps) {
  const { data, isLoading, isError } = useFileContent(file?.path || null);
  const { writeFile, isWriting } = useFilesystemActions();
  const { data: config } = useFilesystemConfig();

  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isNewFile, setIsNewFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  useEffect(() => {
    if (data) {
      setContent(data.content);
      setHasChanges(false);
    }
  }, [data]);

  useEffect(() => {
    if (file && !data && !isLoading) {
      // New file
      setIsNewFile(true);
      setContent('');
      setNewFilePath(file.path);
    }
  }, [file, data, isLoading]);

  const handleSave = () => {
    const path = isNewFile ? newFilePath : file?.path;
    if (!path) return;

    writeFile(
      {
        path,
        content,
        createDirectory: true,
      },
      {
        onSuccess: () => {
          setHasChanges(false);
          if (isNewFile) {
            setIsNewFile(false);
          }
        },
      }
    );
  };

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== (data?.content || ''));
  };

  if (!file) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a file to view or edit</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Failed to load file</p>
        </CardContent>
      </Card>
    );
  }

  const isReadOnly = config?.readOnly || !file.isWritable;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {isNewFile ? 'New File' : file.name}
          </CardTitle>
          {hasChanges && (
            <span className="text-xs text-yellow-500">(Unsaved changes)</span>
          )}
          {isReadOnly && (
            <span className="text-xs text-muted-foreground">(Read only)</span>
          )}
        </div>
        <div className="flex gap-2">
          {!isReadOnly && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isWriting || !hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              {isWriting ? 'Saving...' : 'Save'}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-2">
        {isNewFile && (
          <div className="mb-2">
            <Input
              placeholder="File path"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {data && (
          <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
            <span>{data.lines} lines</span>
            <span>{data.size} bytes</span>
            <span>Language: {data.language}</span>
          </div>
        )}

        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          readOnly={isReadOnly}
          className="flex-1 font-mono text-sm min-h-[400px] resize-none"
          placeholder={isReadOnly ? '' : 'Enter file content...'}
        />
      </CardContent>
    </Card>
  );
}
