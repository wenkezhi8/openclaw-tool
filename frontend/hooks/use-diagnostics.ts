'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

export type DiagnosticStatus = 'ok' | 'warning' | 'error';

export interface DiagnosticItem {
  id: string;
  name: string;
  status: DiagnosticStatus;
  message: string;
  description: string;
  solution?: string;
  solutionLink?: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticsResult {
  timestamp: string;
  items: DiagnosticItem[];
  summary: {
    total: number;
    ok: number;
    warning: number;
    error: number;
  };
}

export interface DiagnosticsResponse {
  success: boolean;
  data: DiagnosticsResult;
}

const DIAGNOSTICS_QUERY_KEY = ['diagnostics'] as const;

export function useDiagnostics() {
  const result = useQuery<DiagnosticsResult>({
    queryKey: DIAGNOSTICS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<DiagnosticsResponse>(API_ENDPOINTS.DIAGNOSTICS);
      return response.data!.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    ...result,
    isRefetching: result.isFetching && !result.isLoading,
  };
}

export function useDiagnosticsRefresh() {
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.get<DiagnosticsResponse>(API_ENDPOINTS.DIAGNOSTICS);
      return response.data!.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(DIAGNOSTICS_QUERY_KEY, data);
    },
  });

  return {
    refresh: () => refreshMutation.mutate(),
    isRefreshing: refreshMutation.isPending,
  };
}
