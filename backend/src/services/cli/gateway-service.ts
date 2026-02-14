import { exec } from 'child_process';
import { promisify } from 'util';
import { executeCommand } from './openclaw-wrapper';
import type { GatewayState, GatewayMetrics } from '../../types';

const execAsync = promisify(exec);

/**
 * Check if gateway service is installed
 */
export async function isGatewayServiceInstalled(): Promise<boolean> {
  const result = await executeCommand(['gateway', 'status'], { timeout: 10000 });

  // Check if service is installed (even if not running)
  const output = result.stdout + result.stderr;
  if (output.includes('Service not installed') || output.includes('Service unit not found')) {
    return false;
  }

  return true;
}

/**
 * Install Gateway Service
 */
export async function installGateway(): Promise<{ success: boolean; message: string }> {
  const result = await executeCommand(['gateway', 'install'], { timeout: 30000 });

  if (result.exitCode !== 0) {
    return {
      success: false,
      message: result.stderr || 'Failed to install gateway service',
    };
  }

  return {
    success: true,
    message: 'Gateway service installed successfully',
  };
}

/**
 * Get process metrics (CPU, memory, uptime) by PID
 */
async function getProcessMetrics(pid: number): Promise<{
  cpu?: number;
  memory?: { rss: number; heapTotal: number; heapUsed: number; external: number };
  uptime?: number;
}> {
  try {
    // Use ps command to get process info
    // macOS syntax: ps -p PID -o %cpu,rss,etime (no --no-headers on macOS)
    // Linux syntax: ps -p PID -o %cpu,rss,etime --no-headers
    let stdout: string;

    try {
      // Try macOS syntax first (with header, we'll skip it)
      const result = await execAsync(`ps -p ${pid} -o %cpu,rss,etime 2>/dev/null`);
      stdout = result.stdout;
    } catch {
      return {};
    }

    if (!stdout.trim()) {
      return {};
    }

    // Parse ps output - skip header line
    const lines = stdout.trim().split('\n');
    if (lines.length < 2) {
      return {};
    }

    // Data line: "  0.0 130496   36:38"
    // Format: %CPU RSS ELAPSED (no PID since we're querying by PID)
    const dataLine = lines[1];
    const parts = dataLine.trim().split(/\s+/);
    if (parts.length < 3) {
      return {};
    }

    // parts[0] = %CPU, parts[1] = RSS (KB), parts[2]+ = ELAPSED
    const cpu = parseFloat(parts[0]) || 0;
    const rssKB = parseInt(parts[1], 10) || 0;
    const etime = parts.slice(2).join(' ');

    // Parse elapsed time to seconds
    const uptime = parseElapsedTime(etime);

    return {
      cpu,
      memory: {
        rss: rssKB * 1024, // Convert KB to bytes
        heapTotal: rssKB * 1024, // Approximate
        heapUsed: rssKB * 1024 * 0.8, // Approximate
        external: 0,
      },
      uptime,
    };
  } catch {
    return {};
  }
}

/**
 * Parse elapsed time string from ps command
 * Formats: "MM:SS", "HH:MM:SS", "DD-HH:MM:SS", "DD-HH:MM:SS.cc"
 */
function parseElapsedTime(etime: string): number {
  if (!etime) return 0;

  // Remove fractional seconds if present
  const cleanTime = etime.split('.')[0];

  let totalSeconds = 0;

  // Check for days (DD-HH:MM:SS)
  if (cleanTime.includes('-')) {
    const [days, time] = cleanTime.split('-');
    totalSeconds += parseInt(days, 10) * 86400;

    const timeParts = time.split(':');
    if (timeParts.length === 3) {
      totalSeconds += parseInt(timeParts[0], 10) * 3600;
      totalSeconds += parseInt(timeParts[1], 10) * 60;
      totalSeconds += parseInt(timeParts[2], 10);
    } else if (timeParts.length === 2) {
      totalSeconds += parseInt(timeParts[0], 10) * 60;
      totalSeconds += parseInt(timeParts[1], 10);
    }
  } else {
    // No days (HH:MM:SS or MM:SS)
    const parts = cleanTime.split(':');
    if (parts.length === 3) {
      totalSeconds += parseInt(parts[0], 10) * 3600;
      totalSeconds += parseInt(parts[1], 10) * 60;
      totalSeconds += parseInt(parts[2], 10);
    } else if (parts.length === 2) {
      totalSeconds += parseInt(parts[0], 10) * 60;
      totalSeconds += parseInt(parts[1], 10);
    } else {
      totalSeconds = parseInt(parts[0], 10) || 0;
    }
  }

  return totalSeconds;
}

/**
 * Get Gateway Status
 */
export async function getGatewayStatus(): Promise<GatewayState> {
  const result = await executeCommand(['gateway', 'status'], { timeout: 10000 });

  const output = result.stdout + result.stderr;

  // Check if service is not installed
  if (output.includes('Service not installed') || output.includes('Service unit not found')) {
    return {
      status: 'not_installed',
      lastError: 'Gateway service is not installed. Click "Install Service" first.',
    };
  }

  if (result.exitCode !== 0) {
    return {
      status: 'stopped',
      lastError: result.stderr || 'Failed to get status',
    };
  }

  // Parse status output
  const status: GatewayState = {
    status: 'stopped',
  };

  // Parse Runtime line: "Runtime: running (pid 7772, state active)"
  const runtimeMatch = output.match(/Runtime:\s*(\w+)\s*\(pid\s*(\d+),\s*state\s*(\w+)\)/);
  if (runtimeMatch) {
    const [, runState, pid, state] = runtimeMatch;
    if (runState === 'running' && state === 'active') {
      status.status = 'running';
      status.pid = parseInt(pid, 10);
    }
  }

  // Parse Listening line: "Listening: 127.0.0.1:18789"
  const listeningMatch = output.match(/Listening:\s*[\d.]+:(\d+)/);
  if (listeningMatch) {
    status.port = parseInt(listeningMatch[1], 10);
  }

  // Parse port from Gateway line: "Gateway: bind=loopback (127.0.0.1), port=18789"
  if (!status.port) {
    const portMatch = output.match(/port=(\d+)/);
    if (portMatch) {
      status.port = parseInt(portMatch[1], 10);
    }
  }

  // If we detected running state but no specific data, still report running
  if (status.status !== 'running' && (output.includes('running') || output.includes('RPC probe: ok'))) {
    status.status = 'running';
  }

  // Check for stopped/not running
  if (output.includes('RPC probe: failed') || output.includes('gateway closed')) {
    status.status = 'stopped';
  }

  // Get process metrics if gateway is running with a PID
  if (status.status === 'running' && status.pid) {
    const metrics = await getProcessMetrics(status.pid);
    if (metrics.cpu !== undefined) {
      status.cpu = metrics.cpu;
    }
    if (metrics.memory) {
      status.memory = metrics.memory;
    }
    if (metrics.uptime !== undefined) {
      status.uptime = metrics.uptime;
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
 * Get Gateway Metrics (Usage Cost)
 */
export async function getGatewayMetrics(_period: string = '1h'): Promise<GatewayMetrics> {
  // Try to get usage cost from gateway
  const result = await executeCommand(['gateway', 'usage-cost'], { timeout: 10000 });

  const defaultMetrics: GatewayMetrics = {
    totalCost: 0,
    totalTokens: 0,
    latestDay: '',
    latestDayCost: 0,
    latestDayTokens: 0,
    requests: { total: 0, success: 0, error: 0 },
    latency: { p50: 0, p95: 0, p99: 0 },
    throughput: 0,
    timestamp: new Date().toISOString(),
  };

  if (result.exitCode !== 0) {
    return defaultMetrics;
  }

  try {
    const output = result.stdout.trim();

    // Parse output like:
    // Usage cost (30 days)
    // Total: $0.0000 · 241k tokens
    // Latest day: 2026-02-14 · $0.0000 · 241k tokens

    // Parse "Total: $0.0000 · 241k tokens"
    const totalMatch = output.match(/Total:\s*\$([0-9.]+)\s*·\s*([0-9.]+[km]?)\s*tokens/i);
    if (totalMatch) {
      defaultMetrics.totalCost = parseFloat(totalMatch[1]) || 0;
      defaultMetrics.totalTokens = parseTokenCount(totalMatch[2]);
    }

    // Parse "Latest day: 2026-02-14 · $0.0000 · 241k tokens"
    const latestMatch = output.match(/Latest day:\s*(\d{4}-\d{2}-\d{2})\s*·\s*\$([0-9.]+)\s*·\s*([0-9.]+[km]?)\s*tokens/i);
    if (latestMatch) {
      defaultMetrics.latestDay = latestMatch[1];
      defaultMetrics.latestDayCost = parseFloat(latestMatch[2]) || 0;
      defaultMetrics.latestDayTokens = parseTokenCount(latestMatch[3]);
    }

    // Estimate request count from tokens (rough estimate: ~500 tokens per request)
    defaultMetrics.requests.total = Math.round(defaultMetrics.totalTokens / 500);
    defaultMetrics.requests.success = defaultMetrics.requests.total;

    return defaultMetrics;
  } catch {
    return defaultMetrics;
  }
}

/**
 * Parse token count string like "241k" or "1.5m" to number
 */
function parseTokenCount(str: string): number {
  if (!str) return 0;

  const match = str.match(/^([0-9.]+)([km]?)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]) || 0;
  const suffix = match[2].toLowerCase();

  if (suffix === 'k') {
    return value * 1000;
  } else if (suffix === 'm') {
    return value * 1000000;
  }

  return value;
}
