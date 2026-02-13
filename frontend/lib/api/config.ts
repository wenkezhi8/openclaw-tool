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

  // Messaging Channels
  MESSAGING_CHANNELS: '/messaging-channels',
  MESSAGING_CHANNEL_DETAIL: (id: string) => `/messaging-channels/${id}`,
  MESSAGING_CHANNEL_CONNECT: (id: string) => `/messaging-channels/${id}/connect`,
  MESSAGING_CHANNEL_DISCONNECT: (id: string) => `/messaging-channels/${id}/disconnect`,

  // Skills
  SKILLS: '/skills',
  SKILL_DETAIL: (id: string) => `/skills/${id}`,
  SKILLS_MARKETPLACE: '/skills/marketplace',
  SKILLS_INSTALL: '/skills/install',
  SKILL_APPROVE: (id: string) => `/skills/${id}/approve`,
  SKILL_TOGGLE: (id: string) => `/skills/${id}/toggle`,

  // Browser
  BROWSER_SESSIONS: '/browser/sessions',
  BROWSER_SESSION_DETAIL: (id: string) => `/browser/sessions/${id}`,
  BROWSER_SESSION_NAVIGATE: (id: string) => `/browser/sessions/${id}/navigate`,
  BROWSER_SESSION_SCREENSHOT: (id: string) => `/browser/sessions/${id}/screenshot`,
  BROWSER_SESSION_CLICK: (id: string) => `/browser/sessions/${id}/click`,
  BROWSER_SESSION_FILL: (id: string) => `/browser/sessions/${id}/fill`,
  BROWSER_SESSION_EXTRACT: (id: string) => `/browser/sessions/${id}/extract`,
  BROWSER_SESSION_WAIT: (id: string) => `/browser/sessions/${id}/wait`,
  BROWSER_SESSION_CONTENT: (id: string) => `/browser/sessions/${id}/content`,
  BROWSER_SESSION_EVALUATE: (id: string) => `/browser/sessions/${id}/evaluate`,
  BROWSER_SESSION_PAGES: (id: string) => `/browser/sessions/${id}/pages`,

  // Memory
  MEMORY_STATUS: '/memory',
  MEMORY_SOUL: '/memory/soul',
  MEMORY_USER: '/memory/user',
  MEMORY_USER_DETAIL: (id: string) => `/memory/user/${id}`,
  MEMORY_SEARCH: '/memory/search',
  MEMORY_CLEAR: '/memory/clear',
  MEMORY_BACKUP: '/memory/backup',

  // Heartbeat
  HEARTBEAT_CONFIG: '/heartbeat',
  HEARTBEAT_TASKS: '/heartbeat/tasks',
  HEARTBEAT_TASK_DETAIL: (id: string) => `/heartbeat/tasks/${id}`,
  HEARTBEAT_TASK_EXECUTE: (id: string) => `/heartbeat/tasks/${id}/execute`,
  HEARTBEAT_TRIGGER: '/heartbeat/trigger',

  // Filesystem
  FS_LIST: '/fs',
  FS_FILE: '/fs/file',
  FS_DIRECTORY: '/fs/directory',
  FS_INFO: '/fs/info',
  FS_CONFIG: '/fs/config',
} as const;
