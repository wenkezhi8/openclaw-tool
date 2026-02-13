import { executeCommand, executeJsonCommand } from './openclaw-wrapper';
import type { Model, CreateModelRequest } from '../../types';

/**
 * List Models
 */
export async function listModels(channel?: string): Promise<{ success: boolean; data?: Model[]; error?: string }> {
  const args = ['models', 'list', '--json'];

  if (channel) {
    args.push('--channel', channel);
  }

  const result = await executeJsonCommand<Model[]>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to list models' };
  }

  return { success: true, data: result.data || [] };
}

/**
 * Get Model by ID
 */
export async function getModel(id: string): Promise<{ success: boolean; data?: Model; error?: string }> {
  const result = await executeJsonCommand<Model>(['models', 'get', id, '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Model not found' };
  }

  return { success: true, data: result.data };
}

/**
 * Add Model
 */
export async function addModel(request: CreateModelRequest): Promise<{ success: boolean; data?: Model; error?: string }> {
  const args = [
    'models',
    'add',
    request.id,
    '--name',
    request.name,
    '--channel',
    request.channel,
    '--json',
  ];

  if (!request.enabled) {
    args.push('--disabled');
  }

  const result = await executeJsonCommand<Model>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to add model' };
  }

  return { success: true, data: result.data };
}

/**
 * Delete Model
 */
export async function deleteModel(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['models', 'delete', id]);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to delete model' };
  }

  return { success: true };
}

/**
 * Update Model
 */
export async function updateModel(id: string, data: Partial<{ enabled: boolean; name: string }>): Promise<{ success: boolean; data?: Model; error?: string }> {
  const args = ['models', 'update', id, '--json'];

  if (data.name) {
    args.push('--name', data.name);
  }

  if (data.enabled !== undefined) {
    args.push(data.enabled ? '--enabled' : '--disabled');
  }

  const result = await executeJsonCommand<Model>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to update model' };
  }

  return { success: true, data: result.data };
}
