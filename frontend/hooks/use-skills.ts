'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  Skill,
  MarketplaceSkill,
  SkillListParams,
  SkillSearchParams,
  InstallSkillRequest,
  UpdateSkillApprovalRequest,
} from '@/types/skill';
import type { PaginationMeta } from '@/types/api';

interface SkillsResponse {
  skills: Skill[];
  pagination: PaginationMeta;
}

interface MarketplaceResponse {
  skills: MarketplaceSkill[];
  pagination: PaginationMeta;
}

const SKILLS_QUERY_KEY = ['skills'] as const;
const MARKETPLACE_QUERY_KEY = ['skills', 'marketplace'] as const;

export function useSkills(params: SkillListParams = {}) {
  return useQuery<SkillsResponse>({
    queryKey: [...SKILLS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<SkillsResponse>(API_ENDPOINTS.SKILLS, params as Record<string, unknown>);
      return response.data!;
    },
  });
}

export function useSkill(id: string) {
  return useQuery<Skill>({
    queryKey: [...SKILLS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Skill>(API_ENDPOINTS.SKILL_DETAIL(id));
      return response.data!;
    },
    enabled: !!id,
  });
}

export function useMarketplace(params: SkillSearchParams = {}) {
  return useQuery<MarketplaceResponse>({
    queryKey: [...MARKETPLACE_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<MarketplaceResponse>(API_ENDPOINTS.SKILLS_MARKETPLACE, params as Record<string, unknown>);
      return response.data!;
    },
  });
}

export function useSkillActions() {
  const queryClient = useQueryClient();

  const installMutation = useMutation({
    mutationFn: async (request: InstallSkillRequest) => {
      const response = await apiClient.post<Skill>(API_ENDPOINTS.SKILLS_INSTALL, request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_QUERY_KEY });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ message: string }>(API_ENDPOINTS.SKILL_DETAIL(id));
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_QUERY_KEY });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateSkillApprovalRequest }) => {
      const response = await apiClient.put<Skill>(API_ENDPOINTS.SKILL_APPROVE(id), request);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiClient.put<Skill>(API_ENDPOINTS.SKILL_TOGGLE(id), { enabled });
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_QUERY_KEY });
    },
  });

  return {
    installSkill: installMutation.mutate,
    uninstallSkill: uninstallMutation.mutate,
    approveSkill: approveMutation.mutate,
    toggleSkill: toggleMutation.mutate,
    isInstalling: installMutation.isPending,
    isUninstalling: uninstallMutation.isPending,
    isApproving: approveMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}
