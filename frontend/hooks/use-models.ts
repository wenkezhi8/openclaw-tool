'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  ModelListParams,
  ModelTestRequest,
  ModelTestResponse,
} from '@/types/model';

const MODELS_QUERY_KEY = ['models'] as const;

export function useModels(params: ModelListParams = {}) {
  return useQuery<Model[]>({
    queryKey: [...MODELS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<{ models: Model[] }>(API_ENDPOINTS.MODELS, params as Record<string, unknown>);
      return response.data!.models;
    },
  });
}

export function useModelActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateModelRequest) => {
      const response = await apiClient.post<Model>(API_ENDPOINTS.MODELS, data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateModelRequest }) => {
      const response = await apiClient.put<Model>(`${API_ENDPOINTS.MODELS}/${id}`, data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(`${API_ENDPOINTS.MODELS}/${id}`);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELS_QUERY_KEY });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (request: ModelTestRequest) => {
      const response = await apiClient.post<ModelTestResponse>(
        API_ENDPOINTS.MODEL_TEST(request.modelId),
        request
      );
      return response.data!;
    },
  });

  return {
    createModel: createMutation.mutate,
    updateModel: updateMutation.mutate,
    deleteModel: deleteMutation.mutate,
    testModel: testMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testMutation.isPending,
  };
}
