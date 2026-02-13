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
