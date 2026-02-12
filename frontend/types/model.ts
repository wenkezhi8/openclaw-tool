// Model Types
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

export interface Model {
  id: string;
  name: string;
  channel: string;
  channelId: string;
  enabled: boolean;
  contextLength?: number;
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
