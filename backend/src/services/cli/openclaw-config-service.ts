import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { logger } from '../logger';

interface OpenClawGatewayConfig {
  port: number;
  mode: string;
  bind: string;
  auth: {
    mode: string;
    token: string;
  };
}

interface OpenClawConfig {
  gateway?: OpenClawGatewayConfig;
  [key: string]: unknown;
}

const CONFIG_PATH = join(homedir(), '.openclaw', 'openclaw.json');

/**
 * Read OpenClaw configuration file
 */
export async function readOpenClawConfig(): Promise<OpenClawConfig | null> {
  try {
    const content = await readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(content) as OpenClawConfig;
  } catch (error) {
    logger.debug('Failed to read OpenClaw config file', { error });
    return null;
  }
}

/**
 * Write OpenClaw configuration file
 */
export async function writeOpenClawConfig(config: OpenClawConfig): Promise<boolean> {
  try {
    const content = JSON.stringify(config, null, 2);
    await writeFile(CONFIG_PATH, content, 'utf-8');
    logger.info('OpenClaw configuration saved');
    return true;
  } catch (error) {
    logger.error('Failed to write OpenClaw config file', { error });
    return false;
  }
}

/**
 * Update gateway configuration
 */
export async function updateGatewayConfig(options: {
  port?: number;
  token?: string;
}): Promise<{ success: boolean; message: string }> {
  const config = await readOpenClawConfig();

  if (!config) {
    return { success: false, message: 'OpenClaw configuration file not found' };
  }

  // Ensure gateway object exists
  if (!config.gateway) {
    config.gateway = {
      port: 18789,
      mode: 'local',
      bind: 'loopback',
      auth: {
        mode: 'token',
        token: '',
      },
    };
  }

  // Update port if provided
  if (options.port !== undefined) {
    config.gateway.port = options.port;
  }

  // Update token if provided
  if (options.token !== undefined) {
    config.gateway.auth.mode = 'token';
    config.gateway.auth.token = options.token;
  }

  const saved = await writeOpenClawConfig(config);

  if (saved) {
    return { success: true, message: 'Configuration saved successfully' };
  } else {
    return { success: false, message: 'Failed to save configuration' };
  }
}

/**
 * Get OpenClaw Gateway Dashboard URL
 */
export async function getGatewayDashboardUrl(): Promise<string | null> {
  const config = await readOpenClawConfig();

  if (!config?.gateway) {
    return null;
  }

  const { port, bind, auth } = config.gateway;

  // Determine the host based on bind mode
  let host = '127.0.0.1';
  if (bind === 'all' || bind === '0.0.0.0') {
    host = '0.0.0.0';
  } else if (bind === 'loopback' || bind === 'localhost') {
    host = '127.0.0.1';
  }

  // Build the dashboard URL with token if available
  const baseUrl = `http://${host}:${port}/`;

  if (auth?.mode === 'token' && auth.token) {
    return `${baseUrl}#token=${auth.token}`;
  }

  return baseUrl;
}

/**
 * Get OpenClaw Gateway configuration info
 */
export async function getGatewayConfig(): Promise<{
  port: number;
  token: string | null;
  dashboardUrl: string | null;
} | null> {
  const config = await readOpenClawConfig();

  if (!config?.gateway) {
    return null;
  }

  const { port, auth } = config.gateway;
  const token = auth?.mode === 'token' ? auth.token : null;
  const dashboardUrl = await getGatewayDashboardUrl();

  return {
    port,
    token,
    dashboardUrl,
  };
}
