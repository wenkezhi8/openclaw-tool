'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  Channel,
  CliChannelsResponse,
  CreateChannelRequest,
  UpdateChannelRequest,
  ConnectionTestResult,
  TestChannelRequest,
} from '@/types/channel';
import { adaptCliChannel } from '@/types/channel';

const CHANNELS_QUERY_KEY = ['channels'] as const;

export function useChannels() {
  return useQuery<Channel[]>({
    queryKey: CHANNELS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<{ channels: CliChannelsResponse }>(API_ENDPOINTS.CHANNELS);
      // API returns { channels: { chat: {...}, auth: [...], usage: {...} } }
      const channelsData = response.data?.channels;

      if (channelsData && typeof channelsData === 'object') {
        // Convert auth channels to frontend Channel format
        const authChannels = channelsData.auth || [];
        return authChannels.map((cliChannel, index) => adaptCliChannel(cliChannel, index));
      }
      return [];
    },
  });
}

export function useChannelActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateChannelRequest) => {
      const response = await apiClient.post<Channel>(API_ENDPOINTS.CHANNELS, data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChannelRequest }) => {
      const response = await apiClient.put<Channel>(API_ENDPOINTS.CHANNEL_DETAIL(id), data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.CHANNEL_DETAIL(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async ({ id, config }: TestChannelRequest) => {
      const response = await apiClient.post<ConnectionTestResult>(
        API_ENDPOINTS.CHANNEL_TEST(id),
        config ? { config } : {}
      );
      return response.data!;
    },
  });

  return {
    createChannel: createMutation.mutate,
    updateChannel: updateMutation.mutate,
    deleteChannel: deleteMutation.mutate,
    testConnection: testConnectionMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testConnectionMutation.isPending,
  };
}
