import { executeCommand } from './openclaw-wrapper';
import type { InstallationStatus } from '../../types';

/**
 * Get Installation Status
 */
export async function getInstallationStatus(): Promise<InstallationStatus> {
  const result = await executeCommand(['--version']);

  if (result.exitCode !== 0) {
    return {
      installed: false,
    };
  }

  // Parse version from output (e.g., "OpenClaw v1.2.3")
  const versionMatch = result.stdout.match(/v?(\d+\.\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : undefined;

  // Check for updates
  const updateResult = await executeCommand(['--check-update']);
  const updateAvailable = updateResult.exitCode === 0 && updateResult.stdout.includes('available');

  return {
    installed: true,
    version,
    path: '/usr/local/bin/openclaw', // Default path
    updateAvailable,
  };
}

/**
 * Install OpenClaw
 */
export async function installOpenClaw(options?: {
  version?: string;
  force?: boolean;
}): Promise<{ success: boolean; taskId?: string; error?: string }> {
  const args = ['install'];

  if (options?.version) {
    args.push('--version', options.version);
  } else {
    args.push('--latest');
  }

  if (options?.force) {
    args.push('--force');
  }

  // Generate task ID for tracking
  const taskId = `install-${Date.now()}`;

  // Run in background
  executeCommand(args).then((result) => {
    console.log(`Install task ${taskId} completed with exit code ${result.exitCode}`);
  });

  return { success: true, taskId };
}

/**
 * Uninstall OpenClaw
 */
export async function uninstallOpenClaw(): Promise<{ success: boolean; error?: string }> {
  const result = await executeCommand(['uninstall', '--yes']);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to uninstall OpenClaw' };
  }

  return { success: true };
}

/**
 * Update OpenClaw
 */
export async function updateOpenClaw(): Promise<{
  success: boolean;
  fromVersion?: string;
  toVersion?: string;
  error?: string;
}> {
  // Get current version first
  const currentStatus = await getInstallationStatus();

  const result = await executeCommand(['update', '--yes']);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Failed to update OpenClaw' };
  }

  // Get new version
  const newStatus = await getInstallationStatus();

  return {
    success: true,
    fromVersion: currentStatus.version,
    toVersion: newStatus.version,
  };
}
