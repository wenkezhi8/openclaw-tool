'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  GatewayStatusResponse,
  GatewayActionResponse,
  GatewayMetricsResponse,
  GatewayStartOptions,
} from '@/types/gateway';

const GATEWAY_QUERY_KEY = ['gateway'] as const;

export function useGatewayStatus() {
  const result = useQuery<GatewayStatusResponse>({
    queryKey: [...GATEWAY_QUERY_KEY, 'status'],
    queryFn: async () => {
      const response = await apiClient.get<GatewayStatusResponse>(API_ENDPOINTS.GATEWAY_STATUS);
      return response.data!;
    },
    refetchInterval: 5000,
  });

  return {
    ...result,
    isRefetching: result.isFetching && !result.isLoading,
  };
}

export function useGatewayMetrics(period: string = '1h') {
  const result = useQuery<GatewayMetricsResponse>({
    queryKey: [...GATEWAY_QUERY_KEY, 'metrics', period],
    queryFn: async () => {
      const response = await apiClient.get<GatewayMetricsResponse>(API_ENDPOINTS.GATEWAY_METRICS, { period });
      return response.data!;
    },
    refetchInterval: 10000,
  });

  return {
    ...result,
    isRefetching: result.isFetching && !result.isLoading,
  };
}

export function useGatewayActions() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: async (options?: GatewayStartOptions) => {
      const response = await apiClient.post<GatewayActionResponse>(API_ENDPOINTS.GATEWAY_START, options);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GATEWAY_QUERY_KEY });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<GatewayActionResponse>(API_ENDPOINTS.GATEWAY_STOP);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GATEWAY_QUERY_KEY });
    },
  });

  const restartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<GatewayActionResponse>(API_ENDPOINTS.GATEWAY_RESTART);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GATEWAY_QUERY_KEY });
    },
  });

  return {
    startGateway: (options?: GatewayStartOptions) => startMutation.mutate(options),
    stopGateway: () => stopMutation.mutate(),
    restartGateway: () => restartMutation.mutate(),
    isLoading: startMutation.isPending || stopMutation.isPending || restartMutation.isPending,
  };
}
