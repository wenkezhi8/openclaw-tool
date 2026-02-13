// Messaging Channel Types
export type MessagingProvider = 'telegram' | 'discord' | 'slack' | 'whatsapp' | 'wechat';
export type MessagingChannelStatus = 'connected' | 'disconnected' | 'pairing' | 'error';

export interface MessagingChannelConfig {
  // Provider-specific configuration
  botToken?: string;
  webhookUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  // Generic fields
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
