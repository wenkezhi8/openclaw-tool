// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

// API Endpoints
export const API_ENDPOINTS = {
  // Gateway
  GATEWAY_STATUS: '/gateway/status',
  GATEWAY_START: '/gateway/start',
  GATEWAY_STOP: '/gateway/stop',
  GATEWAY_RESTART: '/gateway/restart',
  GATEWAY_METRICS: '/gateway/metrics',

  // Agents
  AGENTS: '/agents',
  AGENT_DETAIL: (id: string) => `/agents/${id}`,
  AGENTS_BATCH: '/agents/batch',

  // Channels
  CHANNELS: '/channels',
  CHANNEL_DETAIL: (id: string) => `/channels/${id}`,
  CHANNEL_TEST: (id: string) => `/channels/${id}/test`,

  // Models
  MODELS: '/models',
  MODEL_TEST: (id: string) => `/models/${id}/test`,

  // Installation
  INSTALL_STATUS: '/install/status',
  INSTALL: '/install',
  INSTALL_UPDATE: '/install/update',
} as const;
