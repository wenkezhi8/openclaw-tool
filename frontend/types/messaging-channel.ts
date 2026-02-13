// Messaging Channel Types
export type MessagingProvider = 'telegram' | 'discord' | 'slack' | 'whatsapp' | 'wechat';
export type MessagingChannelStatus = 'connected' | 'disconnected' | 'pairing' | 'error';

export interface MessagingChannelConfig {
  botToken?: string;
  webhookUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  [key: string]: unknown;
}

export interface MessagingChannel {
  id: string;
  name: string;
  provider: MessagingProvider;
  status: MessagingChannelStatus;
  enabled: boolean;
  config: MessagingChannelConfig;
  createdAt: string;
  updatedAt: string;
  lastConnectedAt?: string;
  lastError?: string;
}

export interface CreateMessagingChannelRequest {
  name: string;
  provider: MessagingProvider;
  enabled: boolean;
  config: MessagingChannelConfig;
}

export interface UpdateMessagingChannelRequest {
  name?: string;
  enabled?: boolean;
  config?: Partial<MessagingChannelConfig>;
}

export interface PairingResult {
  success: boolean;
  qrCode?: string;
  pairingUrl?: string;
  expiresIn?: number;
  message?: string;
}

// CLI response types
export interface CliMessagingChannel {
  id: string;
  provider: string;
  status: string;
  isExternal: boolean;
  config?: Record<string, unknown>;
}

export interface CliMessagingChannelsResponse {
  channels: CliMessagingChannel[];
}

// Provider display info
export const PROVIDER_INFO: Record<MessagingProvider, { name: string; icon: string; color: string }> = {
  telegram: { name: 'Telegram', icon: 'Send', color: 'text-blue-500' },
  discord: { name: 'Discord', icon: 'MessageCircle', color: 'text-indigo-500' },
  slack: { name: 'Slack', icon: 'Hash', color: 'text-purple-500' },
  whatsapp: { name: 'WhatsApp', icon: 'MessageSquare', color: 'text-green-500' },
  wechat: { name: 'WeChat', icon: 'MessageSquare', color: 'text-green-600' },
};

// Helper to convert CLI messaging channel to frontend channel
export function adaptCliMessagingChannel(cliChannel: CliMessagingChannel, index: number): MessagingChannel {
  return {
    id: cliChannel.id,
    name: cliChannel.id.split(':').pop() || cliChannel.id,
    provider: cliChannel.provider as MessagingProvider,
    status: (cliChannel.status || 'disconnected') as MessagingChannelStatus,
    enabled: true,
    config: cliChannel.config || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
