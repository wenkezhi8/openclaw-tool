'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  MemoryStatus,
  SoulConfig,
  UserMemoryListResponse,
  UserMemory,
  SearchMemoryParams,
  SearchMemoryResult,
  ClearMemoryParams,
  BackupMemoryResult,
} from '@/types/memory';

const MEMORY_QUERY_KEY = ['memory'] as const;
const MEMORY_STATUS_KEY = ['memory', 'status'] as const;
const SOUL_CONFIG_KEY = ['memory', 'soul'] as const;
const USER_MEMORY_KEY = ['memory', 'user'] as const;

// Get memory status
export function useMemoryStatus() {
  return useQuery<MemoryStatus>({
    queryKey: MEMORY_STATUS_KEY,
    queryFn: async () => {
      const response = await apiClient.get<MemoryStatus>(API_ENDPOINTS.MEMORY_STATUS);
      return response.data!;
    },
  });
}

// Get soul config
export function useSoulConfig() {
  return useQuery<SoulConfig>({
    queryKey: SOUL_CONFIG_KEY,
    queryFn: async () => {
      const response = await apiClient.get<SoulConfig>(API_ENDPOINTS.MEMORY_SOUL);
      return response.data!;
    },
  });
}

// Get user memory list
export function useUserMemory(page: number = 1, limit: number = 20, type?: 'preference' | 'fact' | 'context') {
  return useQuery<UserMemoryListResponse>({
    queryKey: [...USER_MEMORY_KEY, { page, limit, type }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (type) params.type = type;
      const response = await apiClient.get<UserMemoryListResponse>(API_ENDPOINTS.MEMORY_USER, params);
      return response.data!;
    },
  });
}

// Get single memory by ID
export function useMemory(id: string) {
  return useQuery<UserMemory>({
    queryKey: [...MEMORY_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<UserMemory>(API_ENDPOINTS.MEMORY_USER_DETAIL(id));
      return response.data!;
    },
    enabled: !!id,
  });
}

// Search memory
export function useSearchMemory(params: SearchMemoryParams) {
  return useQuery<SearchMemoryResult>({
    queryKey: ['memory', 'search', params],
    queryFn: async () => {
      const searchParams: Record<string, unknown> = { q: params.query };
      if (params.type) searchParams.type = params.type;
      if (params.limit) searchParams.limit = params.limit;
      const response = await apiClient.get<SearchMemoryResult>(API_ENDPOINTS.MEMORY_SEARCH, searchParams);
      return response.data!;
    },
    enabled: !!params.query,
  });
}

// Memory actions
export function useMemoryActions() {
  const queryClient = useQueryClient();

  // Clear memory
  const clearMemoryMutation = useMutation({
    mutationFn: async (params: ClearMemoryParams) => {
      const response = await apiClient.delete<{ deleted: number; message: string }>(
        API_ENDPOINTS.MEMORY_CLEAR
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_QUERY_KEY });
    },
  });

  // Delete single memory
  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ deleted: number; message: string }>(
        API_ENDPOINTS.MEMORY_USER_DETAIL(id)
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_QUERY_KEY });
    },
  });

  // Backup memory
  const backupMemoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<BackupMemoryResult>(API_ENDPOINTS.MEMORY_BACKUP);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_STATUS_KEY });
    },
  });

  return {
    clearMemory: clearMemoryMutation.mutate,
    deleteMemory: deleteMemoryMutation.mutate,
    backupMemory: backupMemoryMutation.mutate,
    isClearing: clearMemoryMutation.isPending,
    isDeleting: deleteMemoryMutation.isPending,
    isBackingUp: backupMemoryMutation.isPending,
  };
}
