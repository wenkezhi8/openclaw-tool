// Agent Types
export type AgentStatus = 'active' | 'inactive';
export type AgentType = 'chat' | 'completion' | 'embedding' | 'custom';

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  type: AgentType;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDetail extends Agent {
  config: AgentConfig;
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
  type?: AgentType;
  model?: string;
  config?: Partial<AgentConfig>;
}

export interface AgentListParams {
  page?: number;
  limit?: number;
  status?: AgentStatus | 'all';
  type?: AgentType | 'all';
  search?: string;
}
