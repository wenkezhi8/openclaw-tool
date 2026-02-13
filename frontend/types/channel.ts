// Channel Types
export type ChannelType = 'openai' | 'anthropic' | 'azure' | 'custom' | 'api_key';

// Connection status types
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'error';

// API key visibility state
export type ApiKeyVisibility = 'visible' | 'masked' | 'hidden';

export interface ChannelConfig {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  [key: string]: unknown;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latency?: number;
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  enabled: boolean;
  priority: number;
  config: ChannelConfig;
  createdAt: string;
  status?: ConnectionStatus;
  lastChecked?: string;
  lastError?: string;
  // Additional fields from CLI
  provider?: string;
  isExternal?: boolean;
}

export interface CreateChannelRequest {
  name: string;
  type: ChannelType;
  enabled: boolean;
  priority: number;
  config: ChannelConfig;
}

export interface UpdateChannelRequest {
  name?: string;
  enabled?: boolean;
  priority?: number;
  config?: Partial<ChannelConfig>;
}

export interface TestChannelRequest {
  id: string;
  config?: ChannelConfig;
}

// CLI Channel response types
export interface CliAuthChannel {
  id: string;
  provider: string;
  type: string;
  isExternal: boolean;
}

export interface CliChannelsResponse {
  chat?: Record<string, string[]>;
  auth?: CliAuthChannel[];
  usage?: {
    updatedAt: number;
    providers: Array<{
      provider: string;
      displayName: string;
      windows: Array<{
        label: string;
        usedPercent: number;
        resetAt: number;
      }>;
    }>;
  };
}

// Helper to convert CLI auth channel to frontend channel
export function adaptCliChannel(cliChannel: CliAuthChannel, index: number): Channel {
  return {
    id: cliChannel.id,
    name: cliChannel.id.split(':').pop() || cliChannel.id,
    type: (cliChannel.type as ChannelType) || 'api_key',
    enabled: true,
    priority: index,
    config: {},
    createdAt: new Date().toISOString(),
    provider: cliChannel.provider,
    isExternal: cliChannel.isExternal,
  };
}
