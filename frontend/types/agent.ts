// Agent Types
export type AgentStatus = 'active' | 'inactive';
export type AgentType = 'chat' | 'completion' | 'embedding' | 'custom';

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  [key: string]: unknown;
}

// CLI Agent format (returned by OpenClaw CLI)
export interface CliAgent {
  id: string;
  workspace?: string;
  agentDir?: string;
  model: string;
  bindings?: number;
  isDefault?: boolean;
  routes?: string[];
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
  // Additional fields from CLI
  workspace?: string;
  agentDir?: string;
  bindings?: number;
  isDefault?: boolean;
  routes?: string[];
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

// Helper to convert CLI agent to frontend agent
export function adaptCliAgent(cliAgent: CliAgent): Agent {
  return {
    id: cliAgent.id,
    name: cliAgent.id,
    description: '',
    status: 'active',
    type: 'chat',
    model: cliAgent.model,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workspace: cliAgent.workspace,
    agentDir: cliAgent.agentDir,
    bindings: cliAgent.bindings,
    isDefault: cliAgent.isDefault,
    routes: cliAgent.routes,
  };
}
