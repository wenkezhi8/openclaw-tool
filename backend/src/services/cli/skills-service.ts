import { executeCommand, executeJsonCommand } from './openclaw-wrapper';
import type {
  Skill,
  MarketplaceSkill,
  InstallSkillRequest,
  UpdateSkillApprovalRequest,
  SkillSearchParams,
  SkillListParams,
  CliSkill,
  CliMarketplaceSkill,
  CliSkillsResponse,
  CliMarketplaceResponse,
} from '../../types';

/**
 * Adapt CLI skill to frontend skill
 */
function adaptCliSkill(cliSkill: CliSkill): Skill {
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

/**
 * Adapt CLI marketplace skill to frontend marketplace skill
 */
function adaptCliMarketplaceSkill(cliSkill: CliMarketplaceSkill): MarketplaceSkill {
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

/**
 * List installed skills
 */
export async function listSkills(params: SkillListParams = {}): Promise<{
  success: boolean;
  data?: { skills: Skill[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  error?: string;
}> {
  const args = ['skills', 'list', '--json'];

  if (params.status) {
    args.push('--status', params.status);
  }

  if (params.search) {
    args.push('--search', params.search);
  }

  if (params.page) {
    args.push('--page', params.page.toString());
  }

  if (params.limit) {
    args.push('--limit', params.limit.toString());
  }

  const result = await executeJsonCommand<CliSkillsResponse & { pagination?: { page: number; limit: number; total: number } }>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to list skills' };
  }

  const skills = (result.data?.skills || []).map(adaptCliSkill);
  const pagination = {
    page: result.data?.pagination?.page || 1,
    limit: result.data?.pagination?.limit || 50,
    total: result.data?.pagination?.total || skills.length,
    totalPages: Math.ceil((result.data?.pagination?.total || skills.length) / (result.data?.pagination?.limit || 50)),
  };

  return { success: true, data: { skills, pagination } };
}

/**
 * Get skill by ID
 */
export async function getSkill(id: string): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const result = await executeJsonCommand<CliSkill>(['skills', 'get', id, '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Skill not found' };
  }

  return { success: true, data: adaptCliSkill(result.data!) };
}

/**
 * Search marketplace for skills
 */
export async function searchMarketplace(params: SkillSearchParams = {}): Promise<{
  success: boolean;
  data?: { skills: MarketplaceSkill[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  error?: string;
}> {
  const args = ['skills', 'marketplace', '--json'];

  if (params.query) {
    args.push('--query', params.query);
  }

  if (params.category) {
    args.push('--category', params.category);
  }

  if (params.sort) {
    args.push('--sort', params.sort);
  }

  if (params.page) {
    args.push('--page', params.page.toString());
  }

  if (params.limit) {
    args.push('--limit', params.limit.toString());
  }

  const result = await executeJsonCommand<CliMarketplaceResponse>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to search marketplace' };
  }

  const skills = (result.data?.skills || []).map(adaptCliMarketplaceSkill);
  const pagination = {
    page: result.data?.page || 1,
    limit: result.data?.limit || 20,
    total: result.data?.total || skills.length,
    totalPages: Math.ceil((result.data?.total || skills.length) / (result.data?.limit || 20)),
  };

  return { success: true, data: { skills, pagination } };
}

/**
 * Install a skill
 */
export async function installSkill(request: InstallSkillRequest): Promise<{
  success: boolean;
  data?: Skill;
  error?: string;
}> {
  const args = ['skills', 'install', request.id, '--json'];

  if (request.version) {
    args.push('--version', request.version);
  }

  if (request.approve) {
    args.push('--approve');
  }

  const result = await executeJsonCommand<CliSkill>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to install skill' };
  }

  return { success: true, data: adaptCliSkill(result.data!) };
}

/**
 * Uninstall a skill
 */
export async function uninstallSkill(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['skills', 'uninstall', id]);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to uninstall skill' };
  }

  return { success: true };
}

/**
 * Update skill approval status
 */
export async function updateSkillApproval(
  id: string,
  request: UpdateSkillApprovalRequest
): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const args = ['skills', 'approve', id, '--json'];

  if (request.approved) {
    args.push('--approve');
  } else {
    args.push('--reject');
  }

  if (request.reason) {
    args.push('--reason', request.reason);
  }

  const result = await executeJsonCommand<CliSkill>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to update skill approval' };
  }

  return { success: true, data: adaptCliSkill(result.data!) };
}

/**
 * Enable/Disable a skill
 */
export async function toggleSkill(id: string, enabled: boolean): Promise<{ success: boolean; data?: Skill; error?: string }> {
  const args = ['skills', 'toggle', id, '--json', '--' + (enabled ? 'enable' : 'disable')];

  const result = await executeJsonCommand<CliSkill>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to toggle skill' };
  }

  return { success: true, data: adaptCliSkill(result.data!) };
}
