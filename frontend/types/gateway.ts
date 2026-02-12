// Gateway Types
export type GatewayStatus = 'running' | 'stopped' | 'error';

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
