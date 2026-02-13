'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  Agent,
  AgentDetail,
  CliAgent,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentListParams,
  AgentStatus,
} from '@/types/agent';
import { adaptCliAgent } from '@/types/agent';
import type { PaginationMeta } from '@/types/api';

interface PaginatedAgentsResponse {
  agents: Agent[];
  pagination: PaginationMeta;
}

interface CliPaginatedAgentsResponse {
  agents: CliAgent[];
  pagination: PaginationMeta;
}

interface BatchUpdateStatusRequest {
  ids: string[];
  status: AgentStatus;
}

interface BatchDeleteRequest {
  ids: string[];
}

const AGENTS_QUERY_KEY = ['agents'] as const;

export function useAgents(params: AgentListParams = {}) {
  return useQuery<PaginatedAgentsResponse>({
    queryKey: [...AGENTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<CliPaginatedAgentsResponse>(
        API_ENDPOINTS.AGENTS,
        params as Record<string, unknown>
      );
      // Ensure we always return valid data structure
      const data = response.data;
      if (data && typeof data === 'object') {
        const agents = Array.isArray(data.agents)
          ? data.agents.map(adaptCliAgent)
          : [];
        return {
          agents,
          pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
        };
      }
      return { agents: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    },
  });
}

export function useAgent(id: string) {
  return useQuery<AgentDetail>({
    queryKey: [...AGENTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<AgentDetail>(API_ENDPOINTS.AGENT_DETAIL(id));
      return response.data!;
    },
    enabled: !!id,
  });
}

// Custom hook for real-time agent status updates using polling
export function useAgentsRealtime(params: AgentListParams = {}, pollInterval = 15000) {
  return useQuery<PaginatedAgentsResponse>({
    queryKey: [...AGENTS_QUERY_KEY, params, 'realtime'],
    queryFn: async () => {
      const response = await apiClient.get<CliPaginatedAgentsResponse>(
        API_ENDPOINTS.AGENTS,
        params as Record<string, unknown>
      );
      // Ensure we always return valid data structure
      const data = response.data;
      if (data && typeof data === 'object') {
        const agents = Array.isArray(data.agents)
          ? data.agents.map(adaptCliAgent)
          : [];
        return {
          agents,
          pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
        };
      }
      return { agents: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    },
    refetchInterval: pollInterval, // Default changed from 5s to 15s
  });
}

export function useAgentActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateAgentRequest) => {
      const response = await apiClient.post<Agent>(API_ENDPOINTS.AGENTS, data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAgentRequest }) => {
      const response = await apiClient.put<Agent>(API_ENDPOINTS.AGENT_DETAIL(id), data);
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...AGENTS_QUERY_KEY, variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.AGENT_DETAIL(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    },
  });

  // Toggle agent status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ agent, status }: { agent: Agent; status: AgentStatus }) => {
      const response = await apiClient.patch<Agent>(
        API_ENDPOINTS.AGENT_DETAIL(agent.id),
        { status }
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    },
  });

  // Batch delete agents
  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiClient.post<{ message: string; deleted: number }>(
        API_ENDPOINTS.AGENTS_BATCH,
        { action: 'delete', ids }
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    },
  });

  // Batch update agent status
  const batchUpdateStatusMutation = useMutation({
    mutationFn: async (request: BatchUpdateStatusRequest) => {
      const response = await apiClient.post<{ message: string; updated: number }>(
        API_ENDPOINTS.AGENTS_BATCH,
        { action: 'update_status', ...request }
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGENTS_QUERY_KEY });
    },
  });

  return {
    createAgent: createMutation.mutate,
    updateAgent: updateMutation.mutate,
    deleteAgent: deleteMutation.mutate,
    toggleAgentStatus: toggleStatusMutation.mutate,
    batchDeleteAgents: batchDeleteMutation.mutate,
    batchUpdateStatus: batchUpdateStatusMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
    isBatchDeleting: batchDeleteMutation.isPending,
    isBatchUpdating: batchUpdateStatusMutation.isPending,
  };
}
