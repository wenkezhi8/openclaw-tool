import { readFile } from 'fs/promises';
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
