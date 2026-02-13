'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  MessagingChannel,
  CreateMessagingChannelRequest,
  UpdateMessagingChannelRequest,
  PairingResult,
} from '@/types/messaging-channel';

const MESSAGING_CHANNELS_QUERY_KEY = ['messaging-channels'] as const;

export function useMessagingChannels() {
  return useQuery<MessagingChannel[]>({
    queryKey: MESSAGING_CHANNELS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<{ channels: MessagingChannel[] }>(API_ENDPOINTS.MESSAGING_CHANNELS);
      return response.data?.channels || [];
    },
  });
}

export function useMessagingChannel(id: string) {
  return useQuery<MessagingChannel>({
    queryKey: [...MESSAGING_CHANNELS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<MessagingChannel>(API_ENDPOINTS.MESSAGING_CHANNEL_DETAIL(id));
      return response.data!;
    },
    enabled: !!id,
  });
}

export function useMessagingChannelActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateMessagingChannelRequest) => {
      const response = await apiClient.post<MessagingChannel>(API_ENDPOINTS.MESSAGING_CHANNELS, data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_CHANNELS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMessagingChannelRequest }) => {
      const response = await apiClient.put<MessagingChannel>(API_ENDPOINTS.MESSAGING_CHANNEL_DETAIL(id), data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_CHANNELS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.MESSAGING_CHANNEL_DETAIL(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_CHANNELS_QUERY_KEY });
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<PairingResult>(API_ENDPOINTS.MESSAGING_CHANNEL_CONNECT(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_CHANNELS_QUERY_KEY });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.MESSAGING_CHANNEL_DISCONNECT(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGING_CHANNELS_QUERY_KEY });
    },
  });

  return {
    createMessagingChannel: createMutation.mutate,
    updateMessagingChannel: updateMutation.mutate,
    deleteMessagingChannel: deleteMutation.mutate,
    connectMessagingChannel: connectMutation.mutateAsync,
    disconnectMessagingChannel: disconnectMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  };
}
