'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  HeartbeatConfig,
  HeartbeatTaskListResponse,
  HeartbeatTask,
  CreateHeartbeatTaskRequest,
  UpdateHeartbeatTaskRequest,
  TriggerHeartbeatResult,
  UpdateHeartbeatConfigRequest,
  TaskExecutionResult,
} from '@/types/heartbeat';

const HEARTBEAT_QUERY_KEY = ['heartbeat'] as const;
const HEARTBEAT_CONFIG_KEY = ['heartbeat', 'config'] as const;
const HEARTBEAT_TASKS_KEY = ['heartbeat', 'tasks'] as const;

// Get heartbeat config
export function useHeartbeatConfig() {
  return useQuery<HeartbeatConfig>({
    queryKey: HEARTBEAT_CONFIG_KEY,
    queryFn: async () => {
      const response = await apiClient.get<HeartbeatConfig>(API_ENDPOINTS.HEARTBEAT_CONFIG);
      return response.data!;
    },
  });
}

// Get tasks list
export function useHeartbeatTasks(page: number = 1, limit: number = 20) {
  return useQuery<HeartbeatTaskListResponse>({
    queryKey: [...HEARTBEAT_TASKS_KEY, { page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<HeartbeatTaskListResponse>(API_ENDPOINTS.HEARTBEAT_TASKS, { page, limit });
      return response.data!;
    },
  });
}

// Get single task
export function useHeartbeatTask(id: string) {
  return useQuery<HeartbeatTask>({
    queryKey: [...HEARTBEAT_QUERY_KEY, 'task', id],
    queryFn: async () => {
      const response = await apiClient.get<HeartbeatTask>(API_ENDPOINTS.HEARTBEAT_TASK_DETAIL(id));
      return response.data!;
    },
    enabled: !!id,
  });
}

// Heartbeat actions
export function useHeartbeatActions() {
  const queryClient = useQueryClient();

  // Update config
  const updateConfigMutation = useMutation({
    mutationFn: async (request: UpdateHeartbeatConfigRequest) => {
      const response = await apiClient.put<HeartbeatConfig>(API_ENDPOINTS.HEARTBEAT_CONFIG, request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEARTBEAT_CONFIG_KEY });
    },
  });

  // Add task
  const addTaskMutation = useMutation({
    mutationFn: async (request: CreateHeartbeatTaskRequest) => {
      const response = await apiClient.post<HeartbeatTask>(API_ENDPOINTS.HEARTBEAT_TASKS, request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEARTBEAT_TASKS_KEY });
    },
  });

  // Update task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateHeartbeatTaskRequest }) => {
      const response = await apiClient.put<HeartbeatTask>(API_ENDPOINTS.HEARTBEAT_TASK_DETAIL(id), request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEARTBEAT_TASKS_KEY });
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.HEARTBEAT_TASK_DETAIL(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEARTBEAT_TASKS_KEY });
    },
  });

  // Execute task
  const executeTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<TaskExecutionResult>(API_ENDPOINTS.HEARTBEAT_TASK_EXECUTE(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEARTBEAT_TASKS_KEY });
    },
  });

  // Trigger heartbeat
  const triggerHeartbeatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<TriggerHeartbeatResult>(API_ENDPOINTS.HEARTBEAT_TRIGGER);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HEARTBEAT_QUERY_KEY });
    },
  });

  return {
    updateConfig: updateConfigMutation.mutate,
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    executeTask: executeTaskMutation.mutate,
    triggerHeartbeat: triggerHeartbeatMutation.mutate,
    isUpdatingConfig: updateConfigMutation.isPending,
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isExecutingTask: executeTaskMutation.isPending,
    isTriggering: triggerHeartbeatMutation.isPending,
  };
}
