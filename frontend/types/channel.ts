// Channel Types
export type ChannelType = 'openai' | 'anthropic' | 'azure' | 'custom';

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
