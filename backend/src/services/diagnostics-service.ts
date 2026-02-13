import { getInstallationStatus } from './cli/install-service';
import { getGatewayStatus, isGatewayServiceInstalled } from './cli/gateway-service';
import { readOpenClawConfig } from './cli/openclaw-config-service';

export type DiagnosticStatus = 'ok' | 'warning' | 'error';

export interface DiagnosticItem {
  id: string;
  name: string;
  status: DiagnosticStatus;
  message: string;
  description: string;
  solution?: string;
  solutionLink?: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticsResult {
  timestamp: string;
  items: DiagnosticItem[];
  summary: {
    total: number;
    ok: number;
    warning: number;
    error: number;
  };
}

/**
 * Check CLI installation status
 */
async function checkCliInstallation(): Promise<DiagnosticItem> {
  try {
    const status = await getInstallationStatus();

    if (!status.installed) {
      return {
        id: 'cli_installation',
        name: 'CLI Installation',
        status: 'error',
        message: 'OpenClaw CLI is not installed',
        description: 'The OpenClaw CLI tool is required to run and manage the gateway.',
        solution: 'Install OpenClaw CLI using the installation page',
        solutionLink: '/install',
      };
    }

    if (status.updateAvailable) {
      return {
        id: 'cli_installation',
        name: 'CLI Installation',
        status: 'warning',
        message: `OpenClaw CLI v${status.version} installed (update available)`,
        description: 'A newer version of OpenClaw CLI is available.',
        solution: 'Update to the latest version for new features and bug fixes',
        solutionLink: '/install',
        details: { version: status.version, path: status.path },
      };
    }

    return {
      id: 'cli_installation',
      name: 'CLI Installation',
      status: 'ok',
      message: `OpenClaw CLI v${status.version} installed`,
      description: 'OpenClaw CLI is properly installed and up to date.',
      details: { version: status.version, path: status.path },
    };
  } catch (error) {
    return {
      id: 'cli_installation',
      name: 'CLI Installation',
      status: 'error',
      message: 'Failed to check CLI installation status',
      description: 'Unable to determine if OpenClaw CLI is installed.',
      solution: 'Check if OpenClaw CLI is properly installed',
      solutionLink: '/install',
      details: { error: String(error) },
    };
  }
}

/**
 * Check gateway running status
 */
async function checkGatewayStatus(): Promise<DiagnosticItem> {
  try {
    // First check if gateway service is installed
    const isServiceInstalled = await isGatewayServiceInstalled();

    if (!isServiceInstalled) {
      return {
        id: 'gateway_status',
        name: 'Gateway Status',
        status: 'warning',
        message: 'Gateway service is not installed',
        description: 'The gateway service needs to be installed before it can run.',
        solution: 'Install the gateway service on the Gateway page',
        solutionLink: '/gateway',
      };
    }

    const status = await getGatewayStatus();

    if (status.status === 'running') {
      return {
        id: 'gateway_status',
        name: 'Gateway Status',
        status: 'ok',
        message: `Gateway is running on port ${status.port}`,
        description: 'The gateway is operational and accepting connections.',
        details: { port: status.port, pid: status.pid, uptime: status.uptime },
      };
    }

    if (status.status === 'not_installed') {
      return {
        id: 'gateway_status',
        name: 'Gateway Status',
        status: 'warning',
        message: 'Gateway service is not installed',
        description: 'The gateway service needs to be installed before it can run.',
        solution: 'Install the gateway service on the Gateway page',
        solutionLink: '/gateway',
      };
    }

    if (status.status === 'error') {
      return {
        id: 'gateway_status',
        name: 'Gateway Status',
        status: 'error',
        message: 'Gateway encountered an error',
        description: status.lastError || 'The gateway is in an error state.',
        solution: 'Check the gateway logs for more details',
        solutionLink: '/logs',
        details: { error: status.lastError },
      };
    }

    return {
      id: 'gateway_status',
      name: 'Gateway Status',
      status: 'warning',
      message: 'Gateway is not running',
      description: 'The gateway service is installed but not currently running.',
      solution: 'Start the gateway on the Gateway page',
      solutionLink: '/gateway',
    };
  } catch (error) {
    return {
      id: 'gateway_status',
      name: 'Gateway Status',
      status: 'error',
      message: 'Failed to check gateway status',
      description: 'Unable to determine the gateway status.',
      solution: 'Check if the backend server is running properly',
      details: { error: String(error) },
    };
  }
}

/**
 * Check API key configuration
 */
async function checkApiKeyConfig(): Promise<DiagnosticItem> {
  try {
    const config = await readOpenClawConfig();

    if (!config) {
      return {
        id: 'api_key_config',
        name: 'API Key Configuration',
        status: 'warning',
        message: 'OpenClaw configuration file not found',
        description: 'No OpenClaw configuration file exists. API keys may not be configured.',
        solution: 'Configure API keys in Settings',
        solutionLink: '/settings',
      };
    }

    // Check for model provider configurations
    const providers = config.providers as Record<string, { apiKey?: string }> | undefined;
    const configuredProviders: string[] = [];

    const knownProviders = ['openai', 'anthropic', 'google', 'azure', 'deepseek', 'moonshot'];

    if (providers) {
      for (const provider of knownProviders) {
        if (providers[provider]?.apiKey) {
          configuredProviders.push(provider);
        }
      }
    }

    // Check if at least one provider is configured
    if (configuredProviders.length === 0) {
      return {
        id: 'api_key_config',
        name: 'API Key Configuration',
        status: 'warning',
        message: 'No API keys configured',
        description: 'At least one AI provider API key should be configured to use the gateway.',
        solution: 'Configure API keys for your preferred AI providers',
        solutionLink: '/settings',
        details: { missingProviders: knownProviders },
      };
    }

    return {
      id: 'api_key_config',
      name: 'API Key Configuration',
      status: 'ok',
      message: `${configuredProviders.length} API key(s) configured`,
      description: 'API keys are configured for the following providers.',
      details: { configuredProviders },
    };
  } catch (error) {
    return {
      id: 'api_key_config',
      name: 'API Key Configuration',
      status: 'error',
      message: 'Failed to check API key configuration',
      description: 'Unable to verify API key configuration.',
      solution: 'Check if the configuration file is accessible',
      details: { error: String(error) },
    };
  }
}

/**
 * Check platform connectivity
 */
async function checkPlatformConnectivity(): Promise<DiagnosticItem> {
  try {
    // Try to check if we can reach external AI APIs
    const results: { provider: string; reachable: boolean; latency?: number }[] = [];

    // Check OpenAI API
    try {
      const start = Date.now();
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      results.push({
        provider: 'openai',
        reachable: response.ok || response.status === 401, // 401 means reachable but needs auth
        latency: Date.now() - start,
      });
    } catch {
      results.push({ provider: 'openai', reachable: false });
    }

    // Check Anthropic API
    try {
      const start = Date.now();
      const response = await fetch('https://api.anthropic.com/v1/models', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      results.push({
        provider: 'anthropic',
        reachable: response.ok || response.status === 401 || response.status === 403,
        latency: Date.now() - start,
      });
    } catch {
      results.push({ provider: 'anthropic', reachable: false });
    }

    const reachableCount = results.filter(r => r.reachable).length;

    if (reachableCount === 0) {
      return {
        id: 'platform_connectivity',
        name: 'Platform Connectivity',
        status: 'error',
        message: 'Unable to reach AI platforms',
        description: 'Could not connect to any AI provider APIs. Please check your network connection.',
        solution: 'Check your network connection and firewall settings',
        details: { results },
      };
    }

    if (reachableCount < results.length) {
      return {
        id: 'platform_connectivity',
        name: 'Platform Connectivity',
        status: 'warning',
        message: `${reachableCount}/${results.length} platforms reachable`,
        description: 'Some AI platforms could not be reached.',
        solution: 'Check your network connection for unreachable platforms',
        details: { results },
      };
    }

    return {
      id: 'platform_connectivity',
      name: 'Platform Connectivity',
      status: 'ok',
      message: 'All AI platforms reachable',
      description: 'Successfully connected to all checked AI provider APIs.',
      details: { results },
    };
  } catch (error) {
    return {
      id: 'platform_connectivity',
      name: 'Platform Connectivity',
      status: 'error',
      message: 'Failed to check platform connectivity',
      description: 'Unable to verify connectivity to AI platforms.',
      solution: 'Check your network connection',
      details: { error: String(error) },
    };
  }
}

/**
 * Run all diagnostics
 */
export async function runDiagnostics(): Promise<DiagnosticsResult> {
  const items = await Promise.all([
    checkCliInstallation(),
    checkGatewayStatus(),
    checkApiKeyConfig(),
    checkPlatformConnectivity(),
  ]);

  const summary = {
    total: items.length,
    ok: items.filter(i => i.status === 'ok').length,
    warning: items.filter(i => i.status === 'warning').length,
    error: items.filter(i => i.status === 'error').length,
  };

  return {
    timestamp: new Date().toISOString(),
    items,
    summary,
  };
}
