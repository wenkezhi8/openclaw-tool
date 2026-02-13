import { executeCommand, executeJsonCommand } from './openclaw-wrapper';
import type {
  MessagingChannel,
  CreateMessagingChannelRequest,
  UpdateMessagingChannelRequest,
  PairingResult,
  CliMessagingChannel,
  CliMessagingChannelsResponse,
} from '../../types';

/**
 * List Messaging Channels
 */
export async function listMessagingChannels(): Promise<{
  success: boolean;
  data?: MessagingChannel[];
  error?: string;
}> {
  const result = await executeJsonCommand<CliMessagingChannelsResponse>(['messaging', 'list', '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to list messaging channels' };
  }

  const channels: MessagingChannel[] = (result.data?.channels || []).map(
    (cliChannel: CliMessagingChannel) => ({
      id: cliChannel.id,
      name: cliChannel.id.split(':').pop() || cliChannel.id,
      provider: cliChannel.provider as MessagingChannel['provider'],
      status: (cliChannel.status || 'disconnected') as MessagingChannel['status'],
      enabled: true,
      config: cliChannel.config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  );

  return { success: true, data: channels };
}

/**
 * Get Messaging Channel by ID
 */
export async function getMessagingChannel(id: string): Promise<{
  success: boolean;
  data?: MessagingChannel;
  error?: string;
}> {
  const result = await executeJsonCommand<CliMessagingChannel>(['messaging', 'get', id, '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Messaging channel not found' };
  }

  const channel: MessagingChannel = {
    id: result.data!.id,
    name: result.data!.id.split(':').pop() || result.data!.id,
    provider: result.data!.provider as MessagingChannel['provider'],
    status: (result.data!.status || 'disconnected') as MessagingChannel['status'],
    enabled: true,
    config: result.data!.config || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: channel };
}

/**
 * Add Messaging Channel
 */
export async function addMessagingChannel(
  request: CreateMessagingChannelRequest
): Promise<{ success: boolean; data?: MessagingChannel; error?: string }> {
  const args = [
    'messaging',
    'add',
    request.name,
    '--provider',
    request.provider,
    '--json',
  ];

  if (request.config?.botToken) {
    args.push('--bot-token', request.config.botToken);
  }

  if (request.config?.webhookUrl) {
    args.push('--webhook-url', request.config.webhookUrl);
  }

  if (request.config?.apiKey) {
    args.push('--api-key', request.config.apiKey);
  }

  if (!request.enabled) {
    args.push('--disabled');
  }

  const result = await executeJsonCommand<CliMessagingChannel>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to add messaging channel' };
  }

  const channel: MessagingChannel = {
    id: result.data!.id,
    name: request.name,
    provider: request.provider,
    status: 'disconnected',
    enabled: request.enabled,
    config: request.config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: channel };
}

/**
 * Update Messaging Channel
 */
export async function updateMessagingChannel(
  id: string,
  request: UpdateMessagingChannelRequest
): Promise<{ success: boolean; data?: MessagingChannel; error?: string }> {
  const args = ['messaging', 'update', id, '--json'];

  if (request.name) {
    args.push('--name', request.name);
  }

  if (request.enabled !== undefined) {
    if (request.enabled) {
      args.push('--enable');
    } else {
      args.push('--disable');
    }
  }

  if (request.config?.botToken) {
    args.push('--bot-token', request.config.botToken);
  }

  if (request.config?.webhookUrl) {
    args.push('--webhook-url', request.config.webhookUrl);
  }

  const result = await executeJsonCommand<CliMessagingChannel>(args);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to update messaging channel' };
  }

  return getMessagingChannel(id);
}

/**
 * Delete Messaging Channel
 */
export async function deleteMessagingChannel(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['messaging', 'delete', id]);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to delete messaging channel' };
  }

  return { success: true };
}

/**
 * Connect/Pair Messaging Channel
 */
export async function connectMessagingChannel(id: string): Promise<{
  success: boolean;
  data?: PairingResult;
  error?: string;
}> {
  const result = await executeJsonCommand<PairingResult>(['messaging', 'connect', id, '--json']);

  if (!result.success) {
    return { success: false, error: result.error || 'Failed to connect messaging channel' };
  }

  return { success: true, data: result.data };
}

/**
 * Disconnect Messaging Channel
 */
export async function disconnectMessagingChannel(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['messaging', 'disconnect', id]);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to disconnect messaging channel' };
  }

  return { success: true };
}
