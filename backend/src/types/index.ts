// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Gateway Types
export type GatewayStatus = 'running' | 'stopped' | 'error' | 'not_installed';

export interface GatewayState {
  status: GatewayStatus;
  pid?: number;
  uptime?: number;
  memory?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu?: number;
  port?: number;
  lastError?: string | null;
}

export interface GatewayMetrics {
  // Usage cost data from OpenClaw CLI
  totalCost: number;
  totalTokens: number;
  latestDay: string;
  latestDayCost: number;
  latestDayTokens: number;
  // Keep for backward compatibility
  requests: {
    total: number;
    success: number;
    error: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  timestamp: string;
}

// Agent Types
export type AgentStatus = 'active' | 'inactive';
export type AgentType = 'chat' | 'completion' | 'embedding';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  type: AgentType;
  model: string;
  config: AgentConfig;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  type: AgentType;
  model: string;
  config: AgentConfig;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  status?: AgentStatus;
  config?: Partial<AgentConfig>;
}

// Channel Types
export type ChannelType = 'openai' | 'anthropic' | 'azure' | 'custom';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  enabled: boolean;
  priority: number;
  config: ChannelConfig;
  createdAt: string;
}

export interface ChannelConfig {
  apiKey: string;
  baseURL?: string;
  [key: string]: unknown;
}

export interface CreateChannelRequest {
  name: string;
  type: ChannelType;
  enabled: boolean;
  priority: number;
  config: ChannelConfig;
}

export interface UpdateChannelRequest {
  enabled?: boolean;
  priority?: number;
  config?: Partial<ChannelConfig>;
}

// Model Types
export interface Model {
  id: string;
  name: string;
  channel: string;
  enabled: boolean;
  contextLength?: number;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface CreateModelRequest {
  id: string;
  name: string;
  channel: string;
  enabled: boolean;
}

// Installation Types
export interface InstallationStatus {
  installed: boolean;
  version?: string;
  path?: string;
  latestVersion?: string;
  updateAvailable?: boolean;
}

// CLI Command Types
export interface CliCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface CliOptions {
  timeout?: number;
  env?: Record<string, string>;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// WebSocket Types
export interface WsMessage {
  type: string;
  id?: string;
  data?: unknown;
  timestamp?: string;
}

export type WsMessageType =
  | 'auth'
  | 'auth_result'
  | 'subscribe'
  | 'unsubscribe'
  | 'log'
  | 'gateway_status'
  | 'agent_update'
  | 'metric'
  | 'error'
  | 'ping'
  | 'pong';

export interface WsClientMessage {
  type: WsMessageType;
  data?: unknown;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  component: string;
  timestamp: string;
}

// Messaging Channel Types
export * from './messaging-channel';

// Skill Types
export * from './skill';

// Browser Types
export * from './browser';

// Memory Types
export * from './memory';

// Heartbeat Types
export * from './heartbeat';

// Filesystem Types
export * from './filesystem';

// Shell Types
export * from './shell';

// Audit Types
export * from './audit';
