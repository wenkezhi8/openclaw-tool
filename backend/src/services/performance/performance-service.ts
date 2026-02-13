import { logger } from '../logger';
import { cacheService } from '../cache/cache-service';
import type { PerformanceMetric, PerformanceSnapshot, PerformanceConfig } from '../../types/performance';

// Default configuration
const DEFAULT_CONFIG: PerformanceConfig = {
  enabled: true,
  sampleInterval: 60000, // 1 minute
  retentionPeriod: 3600000, // 1 hour
  alertThresholds: {
    memoryUsage: 80,
    cpuUsage: 80,
    eventLoopLag: 100,
    responseTime: 1000,
  },
};

class PerformanceService {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private snapshots: PerformanceSnapshot[] = [];
  private sampleTimer?: NodeJS.Timeout;
  private requestStats = {
    total: 0,
    success: 0,
    errors: 0,
    responseTimes: [] as number[],
  };
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private startTime = Date.now();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (!this.config.enabled) return;

    this.sampleTimer = setInterval(() => {
      this.takeSnapshot();
    }, this.config.sampleInterval);

    logger.info('Performance monitoring started', {
      sampleInterval: this.config.sampleInterval,
    });
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = undefined;
    }

    logger.info('Performance monitoring stopped');
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, unit: PerformanceMetric['unit'], tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    this.cleanupMetrics();

    logger.debug(`Metric recorded: ${name} = ${value} ${unit}`);
  }

  /**
   * Record a request
   */
  recordRequest(success: boolean, responseTime: number): void {
    this.requestStats.total++;
    if (success) {
      this.requestStats.success++;
    } else {
      this.requestStats.errors++;
    }
    this.requestStats.responseTimes.push(responseTime);

    // Keep only last 1000 response times
    if (this.requestStats.responseTimes.length > 1000) {
      this.requestStats.responseTimes.shift();
    }

    // Check for slow requests
    if (responseTime > this.config.alertThresholds.responseTime) {
      logger.warn(`Slow request detected: ${responseTime}ms`, {
        threshold: this.config.alertThresholds.responseTime,
      });
    }
  }

  /**
   * Get current performance snapshot
   */
  getCurrentSnapshot(): PerformanceSnapshot {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = this.getCpuUsage();
    const eventLoopLag = this.measureEventLoopLag();
    const cacheStats = cacheService.getStats();

    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers || 0,
      },
      cpu: cpuUsage,
      eventLoop: {
        lag: eventLoopLag,
      },
      cache: {
        hitRate: cacheStats.hitRate,
        size: cacheStats.totalEntries,
      },
      requests: {
        total: this.requestStats.total,
        success: this.requestStats.success,
        errors: this.requestStats.errors,
        averageResponseTime: this.getAverageResponseTime(),
      },
    };
  }

  /**
   * Get metrics history
   */
  getMetrics(name?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }

    return filtered.slice(-limit);
  }

  /**
   * Get snapshots history
   */
  getSnapshots(limit: number = 60): PerformanceSnapshot[] {
    return this.snapshots.slice(-limit);
  }

  /**
   * Get configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.sampleInterval !== undefined || config.enabled !== undefined) {
      this.stop();
      if (this.config.enabled) {
        this.start();
      }
    }
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.requestStats = {
      total: 0,
      success: 0,
      errors: 0,
      responseTimes: [],
    };
    this.metrics = [];
    this.snapshots = [];
    this.startTime = Date.now();

    logger.info('Performance statistics reset');
  }

  // Private methods

  private takeSnapshot(): void {
    const snapshot = this.getCurrentSnapshot();
    this.snapshots.push(snapshot);

    // Cleanup old snapshots
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.snapshots = this.snapshots.filter((s) => new Date(s.timestamp).getTime() > cutoff);

    // Check thresholds
    this.checkThresholds(snapshot);
  }

  private checkThresholds(snapshot: PerformanceSnapshot): void {
    const { alertThresholds } = this.config;

    // Memory usage
    const memoryUsagePercent = (snapshot.memory.heapUsed / snapshot.memory.heapTotal) * 100;
    if (memoryUsagePercent > alertThresholds.memoryUsage) {
      logger.warn(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`, {
        threshold: alertThresholds.memoryUsage,
        heapUsed: snapshot.memory.heapUsed,
        heapTotal: snapshot.memory.heapTotal,
      });
    }

    // Event loop lag
    if (snapshot.eventLoop.lag > alertThresholds.eventLoopLag) {
      logger.warn(`High event loop lag: ${snapshot.eventLoop.lag}ms`, {
        threshold: alertThresholds.eventLoopLag,
      });
    }
  }

  private getCpuUsage(): { user: number; system: number } {
    const currentUsage = process.cpuUsage(this.lastCpuUsage ?? undefined);
    this.lastCpuUsage = process.cpuUsage();

    return {
      user: currentUsage.user / 1000, // Convert to milliseconds
      system: currentUsage.system / 1000,
    };
  }

  private measureEventLoopLag(): number {
    const start = Date.now();
    return new Promise((resolve) => {
      setImmediate(() => {
        resolve(Date.now() - start);
      });
    }) as unknown as number; // Synchronous approximation
  }

  private getAverageResponseTime(): number {
    const times = this.requestStats.responseTimes;
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  private cleanupMetrics(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.metrics = this.metrics.filter((m) => new Date(m.timestamp).getTime() > cutoff);
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Export class for testing
export { PerformanceService };
