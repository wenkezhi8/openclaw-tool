// Gateway Types
export type GatewayStatus = 'running' | 'stopped' | 'error' | 'not_installed';

export interface GatewayMemoryInfo {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface GatewayStatusResponse {
  status: GatewayStatus;
  pid?: number;
  uptime?: number;
  memory?: GatewayMemoryInfo;
  cpu?: number;
  port?: number;
  lastError?: string | null;
}

export interface GatewayActionResponse {
  status: GatewayStatus;
  pid?: number;
  message: string;
}

export interface GatewayMetricsResponse {
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

export interface GatewayStartOptions {
  port?: number;
  workers?: number;
}
