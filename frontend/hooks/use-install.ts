'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  InstallStatus,
  InstallRequest,
  InstallResponse,
  UpdateResponse,
} from '@/types/install';

const INSTALL_QUERY_KEY = ['install'] as const;

/**
 * Local fallback to detect openclaw installation
 * This is used when the backend API is unavailable
 */
async function detectLocalInstallStatus(): Promise<InstallStatus> {
  try {
    // Check if openclaw command exists
    const response = await fetch('/api/install/check-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    // Silently fall through to default status
  }
  return {
    installed: false,
    version: undefined,
    path: undefined,
    latestVersion: undefined,
    updateAvailable: false,
  };
}

export function useInstallStatus() {
  return useQuery<InstallStatus>({
    queryKey: [...INSTALL_QUERY_KEY, 'status'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<InstallStatus>(API_ENDPOINTS.INSTALL_STATUS);
        return response.data!;
      } catch (error) {
        // If backend is unavailable, use local detection as fallback
        console.warn('Backend API unavailable, using local detection:', error);
        return await detectLocalInstallStatus();
      }
    },
    refetchInterval: 30000,
    retry: 2,
  });
}

export function useInstallActions() {
  const queryClient = useQueryClient();

  const installMutation = useMutation({
    mutationFn: async (options?: InstallRequest) => {
      const response = await apiClient.post<InstallResponse>(API_ENDPOINTS.INSTALL, options);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALL_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<UpdateResponse>(API_ENDPOINTS.INSTALL_UPDATE);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALL_QUERY_KEY });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.INSTALL);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALL_QUERY_KEY });
    },
  });

  return {
    install: (options?: InstallRequest) => installMutation.mutate(options),
    update: () => updateMutation.mutate(),
    uninstall: () => uninstallMutation.mutate(),
    isInstalling: installMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUninstalling: uninstallMutation.isPending,
  };
}
