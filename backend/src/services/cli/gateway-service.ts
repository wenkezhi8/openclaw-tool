import { executeCommand } from './openclaw-wrapper';
import type { GatewayState, GatewayMetrics } from '../../types';

/**
 * Get Gateway Status
 */
export async function getGatewayStatus(): Promise<GatewayState> {
  const result = await executeCommand(['gateway', 'status']);

  if (result.exitCode !== 0) {
    return {
      status: 'stopped',
      lastError: result.stderr || 'Failed to get status',
    };
  }

  // Parse status output
  const lines = result.stdout.split('\n');
  const status: GatewayState = {
    status: 'stopped',
  };

  // Simple parsing - adjust based on actual CLI output format
  for (const line of lines) {
    if (line.includes('running') || line.includes('active')) {
      status.status = 'running';
    }
    if (line.includes('PID:')) {
      status.pid = parseInt(line.split(':')[1]?.trim() || '0', 10);
    }
    if (line.includes('Uptime:')) {
      status.uptime = parseUptime(line.split(':')[1]?.trim() || '');
    }
  }

  return status;
}

/**
 * Start Gateway
 */
export async function startGateway(options?: {
  port?: number;
  workers?: number;
}): Promise<GatewayState> {
  const args = ['gateway', 'start'];

  if (options?.port) {
    args.push('--port', options.port.toString());
  }
  if (options?.workers) {
    args.push('--workers', options.workers.toString());
  }

  const result = await executeCommand(args);

  if (result.exitCode !== 0) {
    return {
      status: 'error',
      lastError: result.stderr || 'Failed to start gateway',
    };
  }

  // Get the new status
  return await getGatewayStatus();
}

/**
 * Stop Gateway
 */
export async function stopGateway(): Promise<GatewayState> {
  const result = await executeCommand(['gateway', 'stop']);

  if (result.exitCode !== 0) {
    return {
      status: 'error',
      lastError: result.stderr || 'Failed to stop gateway',
    };
  }

  return {
    status: 'stopped',
  };
}

/**
 * Restart Gateway
 */
export async function restartGateway(options?: {
  port?: number;
  workers?: number;
}): Promise<GatewayState> {
  await stopGateway();
  // Add a small delay to ensure proper shutdown
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return startGateway(options);
}

/**
 * Get Gateway Metrics
 */
export async function getGatewayMetrics(period: string = '1h'): Promise<GatewayMetrics> {
  const result = await executeCommand(['gateway', 'metrics', '--period', period]);

  if (result.exitCode !== 0) {
    // Return default/empty metrics
    return {
      requests: { total: 0, success: 0, error: 0 },
      latency: { p50: 0, p95: 0, p99: 0 },
      throughput: 0,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const metrics = JSON.parse(result.stdout) as GatewayMetrics;
    return metrics;
  } catch {
    // Return default metrics if parsing fails
    return {
      requests: { total: 0, success: 0, error: 0 },
      latency: { p50: 0, p95: 0, p99: 0 },
      throughput: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Parse uptime string to seconds
 */
function parseUptime(uptimeStr: string): number {
  if (!uptimeStr) return 0;

  const parts = uptimeStr.split(' ');
  let totalSeconds = 0;

  for (const part of parts) {
    const value = parseInt(part, 10);
    if (part.includes('h') || part.includes('hour')) {
      totalSeconds += value * 3600;
    } else if (part.includes('m') || part.includes('min')) {
      totalSeconds += value * 60;
    } else if (part.includes('s') || part.includes('sec')) {
      totalSeconds += value;
    }
  }

  return totalSeconds;
}
