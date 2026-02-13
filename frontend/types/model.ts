// Model Types

// CLI Model format (returned by OpenClaw CLI)
export interface CliModel {
  key: string;
  name: string;
  input: string;
  contextWindow: number;
  local: boolean;
  available: boolean;
  tags: string[];
  missing: boolean;
}

export interface ModelPricing {
  input: number;
  output: number;
}

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  rateLimit?: number;
  retryCount?: number;
  timeout?: number;
}

export interface ModelTestRequest {
  modelId: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelTestResponse {
  success: boolean;
  response?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency?: number;
  error?: string;
}

// Frontend Model type (adapted from CLI format)
export interface Model {
  id: string;
  key: string;
  name: string;
  channel: string;
  channelId: string;
  enabled: boolean;
  available: boolean;
  contextLength?: number;
  input?: string;
  local?: boolean;
  tags?: string[];
  pricing?: ModelPricing;
  config?: ModelConfig;
}

export interface CreateModelRequest {
  id: string;
  name: string;
  channel: string;
  enabled: boolean;
}

export interface UpdateModelRequest {
  enabled?: boolean;
  config?: ModelConfig;
}

export interface ModelListParams {
  channel?: string;
}

// Helper to convert CLI model to frontend model
export function adaptCliModel(cliModel: CliModel): Model {
  return {
    id: cliModel.key,
    key: cliModel.key,
    name: cliModel.name,
    channel: cliModel.key.split('/')[0] || 'unknown',
    channelId: cliModel.key.split('/')[0] || 'unknown',
    enabled: cliModel.available && !cliModel.missing,
    available: cliModel.available,
    contextLength: cliModel.contextWindow,
    input: cliModel.input,
    local: cliModel.local,
    tags: cliModel.tags,
  };
}
