// Performance Types

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: string;
  tags?: Record<string, string>;
}

export interface PerformanceSnapshot {
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  eventLoop: {
    lag: number;
  };
  cache: {
    hitRate: number;
    size: number;
  };
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
}

export interface PerformanceConfig {
  enabled: boolean;
  sampleInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  alertThresholds: {
    memoryUsage: number; // percent
    cpuUsage: number; // percent
    eventLoopLag: number; // milliseconds
    responseTime: number; // milliseconds
  };
}
