'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  FileListResult,
  FileContent,
  FileInfo,
  WriteFileRequest,
  CreateDirectoryRequest,
  DeleteResult,
  FileSystemConfig,
} from '@/types/filesystem';

const FS_QUERY_KEY = ['filesystem'] as const;

// List files
export function useFileList(path: string) {
  return useQuery<FileListResult>({
    queryKey: [...FS_QUERY_KEY, 'list', path],
    queryFn: async () => {
      const response = await apiClient.get<FileListResult>(API_ENDPOINTS.FS_LIST, { path });
      return response.data!;
    },
    enabled: !!path,
  });
}

// Read file
export function useFileContent(path: string | null) {
  return useQuery<FileContent>({
    queryKey: [...FS_QUERY_KEY, 'file', path],
    queryFn: async () => {
      const response = await apiClient.get<FileContent>(API_ENDPOINTS.FS_FILE, { path });
      return response.data!;
    },
    enabled: !!path,
  });
}

// Get file info
export function useFileInfo(path: string) {
  return useQuery<FileInfo>({
    queryKey: [...FS_QUERY_KEY, 'info', path],
    queryFn: async () => {
      const response = await apiClient.get<FileInfo>(API_ENDPOINTS.FS_INFO, { path });
      return response.data!;
    },
    enabled: !!path,
  });
}

// Get filesystem config
export function useFilesystemConfig() {
  return useQuery<FileSystemConfig>({
    queryKey: [...FS_QUERY_KEY, 'config'],
    queryFn: async () => {
      const response = await apiClient.get<FileSystemConfig>(API_ENDPOINTS.FS_CONFIG);
      return response.data!;
    },
  });
}

// Filesystem actions
export function useFilesystemActions() {
  const queryClient = useQueryClient();

  // Write file
  const writeFileMutation = useMutation({
    mutationFn: async (request: WriteFileRequest) => {
      const response = await apiClient.post<FileContent>(API_ENDPOINTS.FS_FILE, request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FS_QUERY_KEY });
    },
  });

  // Delete file
  const deleteFileMutation = useMutation({
    mutationFn: async (path: string) => {
      const response = await apiClient.delete<DeleteResult>(`${API_ENDPOINTS.FS_FILE}?path=${encodeURIComponent(path)}`);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FS_QUERY_KEY });
    },
  });

  // Create directory
  const createDirectoryMutation = useMutation({
    mutationFn: async (request: CreateDirectoryRequest) => {
      const response = await apiClient.post<FileInfo>(API_ENDPOINTS.FS_DIRECTORY, request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FS_QUERY_KEY });
    },
  });

  return {
    writeFile: writeFileMutation.mutate,
    deleteFile: deleteFileMutation.mutate,
    createDirectory: createDirectoryMutation.mutate,
    isWriting: writeFileMutation.isPending,
    isDeleting: deleteFileMutation.isPending,
    isCreatingDir: createDirectoryMutation.isPending,
  };
}
