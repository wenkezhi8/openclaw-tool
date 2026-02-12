import { executeCommand, executeJsonCommand } from './openclaw-wrapper';
import type { Channel, CreateChannelRequest, UpdateChannelRequest } from '../../types';

/**
 * List Channels
 */
export async function listChannels(): Promise<{ success: boolean; data?: Channel[]; error?: string }> {
  const result = await executeJsonCommand<Channel[]>(['channels', 'list', '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to list channels' };
  }

  return { success: true, data: result.data || [] };
}

/**
 * Get Channel by ID
 */
export async function getChannel(id: string): Promise<{ success: boolean; data?: Channel; error?: string }> {
  const result = await executeJsonCommand<Channel>(['channels', 'get', id, '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Channel not found' };
  }

  return { success: true, data: result.data };
}

/**
 * Add Channel
 */
export async function addChannel(request: CreateChannelRequest): Promise<{ success: boolean; data?: Channel; error?: string }> {
  const args = [
    'channels',
    'add',
    request.name,
    '--type',
    request.type,
    '--priority',
    request.priority.toString(),
    '--json',
  ];

  if (request.config.apiKey) {
    args.push('--api-key', request.config.apiKey);
  }

  if (request.config.baseURL) {
    args.push('--base-url', request.config.baseURL);
  }

  if (!request.enabled) {
    args.push('--disabled');
  }

  const result = await executeJsonCommand<Channel>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to add channel' };
  }

  return { success: true, data: result.data };
}

/**
 * Update Channel
 */
export async function updateChannel(
  id: string,
  request: UpdateChannelRequest
): Promise<{ success: boolean; data?: Channel; error?: string }> {
  const args = ['channels', 'update', id, '--json'];

  if (request.enabled !== undefined) {
    if (request.enabled) {
      args.push('--enable');
    } else {
      args.push('--disable');
    }
  }

  if (request.priority !== undefined) {
    args.push('--priority', request.priority.toString());
  }

  if (request.config?.apiKey) {
    args.push('--api-key', request.config.apiKey);
  }

  if (request.config?.baseURL) {
    args.push('--base-url', request.config.baseURL);
  }

  const result = await executeJsonCommand<Channel>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to update channel' };
  }

  return { success: true, data: result.data };
}

/**
 * Delete Channel
 */
export async function deleteChannel(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['channels', 'delete', id]);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to delete channel' };
  }

  return { success: true };
}
