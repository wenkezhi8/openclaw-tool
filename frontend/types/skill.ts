// Skill Types
export type SkillStatus = 'installed' | 'available' | 'updating' | 'error';
export type SkillApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface SkillAuthor {
  name: string;
  url?: string;
}

export interface SkillRepository {
  type: string;
  url: string;
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: SkillAuthor;
  repository?: SkillRepository;
  status: SkillStatus;
  approvalStatus: SkillApprovalStatus;
  enabled: boolean;
  installedAt?: string;
  updatedAt?: string;
  config?: Record<string, unknown>;
  tags?: string[];
}

export interface MarketplaceSkill extends Omit<Skill, 'status' | 'approvalStatus' | 'enabled' | 'installedAt'> {
  downloads: number;
  rating: number;
  ratingCount: number;
  category: string;
  readme?: string;
}

export interface InstallSkillRequest {
  id: string;
  version?: string;
  approve?: boolean;
}

export interface UpdateSkillApprovalRequest {
  approved: boolean;
  reason?: string;
}

export interface SkillSearchParams {
  query?: string;
  category?: string;
  sort?: 'downloads' | 'rating' | 'updated';
  page?: number;
  limit?: number;
}

export interface SkillListParams {
  status?: SkillStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// CLI response types
export interface CliSkill {
  id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  installed?: boolean;
  config?: Record<string, unknown>;
}

export interface CliMarketplaceSkill {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  downloads?: number;
  rating?: number;
  category?: string;
  tags?: string[];
}

export interface CliSkillsResponse {
  skills: CliSkill[];
}

export interface CliMarketplaceResponse {
  skills: CliMarketplaceSkill[];
  total: number;
  page: number;
  limit: number;
}

// Category display info
export const SKILL_CATEGORIES: Record<string, { name: string; icon: string }> = {
  general: { name: 'General', icon: 'Package' },
  automation: { name: 'Automation', icon: 'Zap' },
  integration: { name: 'Integration', icon: 'Link' },
  productivity: { name: 'Productivity', icon: 'TrendingUp' },
  communication: { name: 'Communication', icon: 'MessageCircle' },
  data: { name: 'Data', icon: 'Database' },
};

// Helper to convert CLI skill to frontend skill
export function adaptCliSkill(cliSkill: CliSkill): Skill {
  return {
    id: cliSkill.id,
    name: cliSkill.name,
    version: cliSkill.version,
    description: cliSkill.description || '',
    status: cliSkill.installed ? 'installed' : 'available',
    approvalStatus: 'approved',
    enabled: cliSkill.enabled,
    installedAt: cliSkill.installed ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
    config: cliSkill.config,
  };
}

// Helper to convert CLI marketplace skill to frontend marketplace skill
export function adaptCliMarketplaceSkill(cliSkill: CliMarketplaceSkill): MarketplaceSkill {
  return {
    id: cliSkill.id,
    name: cliSkill.name,
    version: cliSkill.version,
    description: cliSkill.description || '',
    author: cliSkill.author ? { name: cliSkill.author } : undefined,
    downloads: cliSkill.downloads || 0,
    rating: cliSkill.rating || 0,
    ratingCount: 0,
    category: cliSkill.category || 'general',
    tags: cliSkill.tags || [],
  };
}
