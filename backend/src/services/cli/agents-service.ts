import { executeCommand, executeJsonCommand } from './openclaw-wrapper';
import type { Agent, CreateAgentRequest, UpdateAgentRequest, PaginationMeta } from '../../types';

/**
 * List Agents
 */
export async function listAgents(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ agents: Agent[]; pagination: PaginationMeta }> {
  const args = ['agents', 'list', '--json'];

  if (params.status && params.status !== 'all') {
    args.push('--status', params.status);
  }
  if (params.search) {
    args.push('--search', params.search);
  }

  const result = await executeJsonCommand<{ agents: Agent[] }>(args);

  if (!result.success || !result.data) {
    return { agents: [], pagination: { page: 1, limit: params.limit || 20, total: 0, totalPages: 0 } };
  }

  let agents = result.data.agents || [];

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const total = agents.length;
  const totalPages = Math.ceil(total / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  agents = agents.slice(startIndex, endIndex);

  return {
    agents,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Get Agent by ID
 */
export async function getAgent(id: string): Promise<{ success: boolean; data?: Agent; error?: string }> {
  const result = await executeJsonCommand<Agent>(['agents', 'get', id, '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Agent not found' };
  }

  return { success: true, data: result.data };
}

/**
 * Create Agent
 */
export async function createAgent(request: CreateAgentRequest): Promise<{ success: boolean; data?: Agent; error?: string }> {
  const args = [
    'agents',
    'create',
    request.name,
    '--type',
    request.type,
    '--model',
    request.model,
    '--json',
  ];

  if (request.description) {
    args.push('--description', request.description);
  }

  if (request.config.systemPrompt) {
    args.push('--system-prompt', request.config.systemPrompt);
  }

  if (request.config.temperature !== undefined) {
    args.push('--temperature', request.config.temperature.toString());
  }

  if (request.config.maxTokens !== undefined) {
    args.push('--max-tokens', request.config.maxTokens.toString());
  }

  const result = await executeJsonCommand<Agent>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to create agent' };
  }

  return { success: true, data: result.data };
}

/**
 * Update Agent
 */
export async function updateAgent(
  id: string,
  request: UpdateAgentRequest
): Promise<{ success: boolean; data?: Agent; error?: string }> {
  const args = ['agents', 'update', id, '--json'];

  if (request.name) {
    args.push('--name', request.name);
  }

  if (request.description) {
    args.push('--description', request.description);
  }

  if (request.config?.temperature !== undefined) {
    args.push('--temperature', request.config.temperature.toString());
  }

  if (request.config?.maxTokens !== undefined) {
    args.push('--max-tokens', request.config.maxTokens.toString());
  }

  if (request.config?.systemPrompt) {
    args.push('--system-prompt', request.config.systemPrompt);
  }

  const result = await executeJsonCommand<Agent>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to update agent' };
  }

  return { success: true, data: result.data };
}

/**
 * Delete Agent
 */
export async function deleteAgent(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['agents', 'delete', id]);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to delete agent' };
  }

  return { success: true };
}
