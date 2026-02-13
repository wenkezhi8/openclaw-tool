import { executeCommand, checkOpenClawInstalled } from './openclaw-wrapper';
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
  const { spawn } = await import('child_process');

  // Check if openclaw is already installed
  const isInstalled = await checkOpenClawInstalled();

  // Generate task ID for tracking
  const taskId = `install-${Date.now()}`;

  if (isInstalled && !options?.force) {
    // Use openclaw's built-in update/install command
    const args = ['install'];
    if (options?.version) {
      args.push('--version', options.version);
    } else {
      args.push('--latest');
    }
    if (options?.force) {
      args.push('--force');
    }

    // Run in background
    executeCommand(args).then((result) => {
      console.log(`Install task ${taskId} completed with exit code ${result.exitCode}`);
    });
  } else {
    // OpenClaw not installed, use official install script
    // Run installation in background and return immediately
    const installProcess = spawn('bash', ['-c', 'curl -fsSL https://openclaw.ai/install.sh | bash'], {
      env: { ...process.env },
      detached: true,
      stdio: 'ignore',
    });

    installProcess.on('close', (code) => {
      console.log(`Install task ${taskId} completed with exit code ${code}`);
    });

    installProcess.on('error', (error) => {
      console.error(`Install task ${taskId} failed:`, error);
    });

    // Unref to allow the process to run independently
    installProcess.unref();
  }

  return { success: true, taskId };
}

/**
 * Uninstall OpenClaw
 */
export async function uninstallOpenClaw(): Promise<{ success: boolean; error?: string }> {
  const { execSync } = await import('child_process');

  // First try to run openclaw uninstall to clean up services and data
  try {
    await executeCommand(['uninstall', '--all', '--yes']);
  } catch {
    // Ignore errors - CLI might be removed during uninstall
  }

  // Wait a moment for the command to complete
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Try to uninstall via npm/pnpm (OpenClaw is installed as a global package)
  try {
    // Check if installed via homebrew
    execSync('which brew', { stdio: 'pipe' });
    try {
      execSync('brew uninstall openclaw', { stdio: 'pipe' });
    } catch {
      // Not installed via brew, try npm
    }
  } catch {
    // Brew not available, try npm
  }

  // Try npm uninstall
  try {
    execSync('npm uninstall -g openclaw', { stdio: 'pipe' });
  } catch {
    // Ignore errors
  }

  // Wait for uninstall to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verify uninstallation
  const checkResult = await executeCommand(['--version']);
  if (checkResult.exitCode !== 0) {
    return { success: true }; // Successfully uninstalled
  }

  return { success: false, error: 'Failed to uninstall OpenClaw' };
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

  // Increase timeout for update command
  const result = await executeCommand(['update', '--yes'], { timeout: 120000 });

  // Check if update was successful by looking for "Update Result: OK" in output
  // The command may have plugin warnings in stderr but still succeed
  const output = result.stdout + result.stderr;
  const updateSuccessful = output.includes('Update Result: OK') || result.exitCode === 0;

  if (!updateSuccessful && result.exitCode !== 0) {
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
