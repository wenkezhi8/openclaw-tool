import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { logger } from '../logger';
import type {
  ShellConfig,
  CommandRequest,
  CommandResult,
  CommandValidation,
  CommandHistory,
  ShellAuditEntry,
} from '../../types/shell';

// Default configuration for sandbox mode
const DEFAULT_CONFIG: ShellConfig = {
  enabled: true,
  timeout: 30000, // 30 seconds
  maxOutputSize: 1024 * 1024, // 1MB
  allowedCommands: [
    'ls', 'cat', 'head', 'tail', 'grep', 'find', 'wc', 'sort', 'uniq',
    'echo', 'pwd', 'whoami', 'date', 'uname', 'df', 'du', 'free',
    'ps', 'top', 'kill', 'pkill', 'pgrep',
    'git', 'npm', 'node', 'npx', 'yarn', 'pnpm',
    'curl', 'wget',
  ],
  blockedCommands: [
    'rm -rf /', 'mkfs', 'dd', 'format', 'fdisk',
    'shutdown', 'reboot', 'init', 'halt',
    'chmod 777', 'chown',
    '>', '>>', '|', '&&', '||', // No redirection or chaining
    'sudo', 'su', 'doas',
    'passwd', 'useradd', 'userdel', 'usermod',
    'apt', 'yum', 'dnf', 'pacman', 'brew', // Package managers
  ],
  allowedDirectories: [process.cwd()],
  environmentVariables: {
    PATH: process.env.PATH || '',
    HOME: process.env.HOME || '',
    USER: process.env.USER || '',
    LANG: process.env.LANG || 'en_US.UTF-8',
  },
  maxConcurrentCommands: 5,
};

// Current configuration
let currentConfig: ShellConfig = { ...DEFAULT_CONFIG };

// Command history
const commandHistory: CommandResult[] = [];
const auditLog: ShellAuditEntry[] = [];

// Active commands
const activeCommands: Map<string, ChildProcess> = new Map();

/**
 * Configure shell service
 */
export function configureShell(config: Partial<ShellConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
  logger.info('Shell configuration updated', {
    enabled: currentConfig.enabled,
    allowedCommands: currentConfig.allowedCommands.length,
  });
}

/**
 * Get current configuration
 */
export function getConfig(): ShellConfig {
  return { ...currentConfig };
}

/**
 * Validate command before execution
 */
export function validateCommand(request: CommandRequest): CommandValidation {
  const { command, args = [], cwd } = request;

  // Check if shell is enabled
  if (!currentConfig.enabled) {
    return {
      valid: false,
      command,
      args,
      error: 'Shell execution is disabled',
    };
  }

  // Check for blocked commands/patterns
  const fullCommand = `${command} ${args.join(' ')}`.toLowerCase();

  for (const blocked of currentConfig.blockedCommands) {
    if (fullCommand.includes(blocked.toLowerCase())) {
      addAuditEntry(command, args, 'blocked', `Blocked pattern found: ${blocked}`);
      return {
        valid: false,
        command,
        args,
        error: `Command contains blocked pattern: ${blocked}`,
      };
    }
  }

  // Check if command is in whitelist
  const baseCommand = path.basename(command);
  if (!currentConfig.allowedCommands.includes(baseCommand) && !currentConfig.allowedCommands.includes(command)) {
    addAuditEntry(command, args, 'blocked', 'Command not in whitelist');
    return {
      valid: false,
      command,
      args,
      error: `Command '${baseCommand}' is not allowed`,
    };
  }

  // Validate working directory
  if (cwd) {
    const resolvedCwd = path.resolve(cwd);
    const isAllowed = currentConfig.allowedDirectories.some((dir) =>
      resolvedCwd.startsWith(path.resolve(dir))
    );

    if (!isAllowed) {
      addAuditEntry(command, args, 'blocked', 'Directory not allowed');
      return {
        valid: false,
        command,
        args,
        error: `Directory '${cwd}' is not allowed`,
      };
    }
  }

  // Check concurrent command limit
  if (activeCommands.size >= currentConfig.maxConcurrentCommands) {
    return {
      valid: false,
      command,
      args,
      error: `Maximum concurrent commands (${currentConfig.maxConcurrentCommands}) reached`,
    };
  }

  // Sanitize args
  const sanitizedArgs = args.map((arg) => {
    // Remove any shell metacharacters
    return arg.replace(/[;&|`$(){}[\]<>\\]/g, '');
  });

  return {
    valid: true,
    command,
    args: sanitizedArgs,
    sanitizedCommand: `${command} ${sanitizedArgs.join(' ')}`,
  };
}

/**
 * Execute a command
 */
export async function executeCommand(request: CommandRequest): Promise<CommandResult> {
  const validation = validateCommand(request);

  if (!validation.valid) {
    return {
      id: generateCommandId(),
      command: request.command,
      args: request.args || [],
      status: 'failed',
      exitCode: 1,
      stdout: '',
      stderr: validation.error || 'Command validation failed',
      duration: 0,
      timestamp: new Date().toISOString(),
      timedOut: false,
      killed: false,
    };
  }

  const id = generateCommandId();
  const startTime = Date.now();
  const timeout = request.timeout || currentConfig.timeout;
  const cwd = request.cwd
    ? path.resolve(request.cwd)
    : currentConfig.allowedDirectories[0] || process.cwd();

  // Prepare environment
  const env: Record<string, string> = {
    ...currentConfig.environmentVariables,
    ...request.env,
  };

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const killed = false;

    logger.info(`Executing command: ${validation.sanitizedCommand}`, {
      id,
      cwd,
      timeout,
    });

    const childProcess = spawn(validation.command, validation.args, {
      cwd,
      env,
      shell: false, // Don't use shell for security
      timeout,
    });

    activeCommands.set(id, childProcess);

    // Handle stdout
    childProcess.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      if (stdout.length + chunk.length <= currentConfig.maxOutputSize) {
        stdout += chunk;
      }
    });

    // Handle stderr
    childProcess.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      if (stderr.length + chunk.length <= currentConfig.maxOutputSize) {
        stderr += chunk;
      }
    });

    // Handle timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      childProcess.kill('SIGKILL');
    }, timeout);

    // Handle completion
    childProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      activeCommands.delete(id);

      const duration = Date.now() - startTime;
      const status: CommandResult['status'] = timedOut
        ? 'timeout'
        : killed
        ? 'killed'
        : code === 0
        ? 'completed'
        : 'failed';

      const result: CommandResult = {
        id,
        command: request.command,
        args: request.args || [],
        status,
        exitCode: code,
        stdout,
        stderr,
        duration,
        timestamp: new Date().toISOString(),
        timedOut,
        killed,
      };

      // Add to history
      commandHistory.unshift(result);
      if (commandHistory.length > 100) {
        commandHistory.pop();
      }

      // Add audit entry
      addAuditEntry(
        request.command,
        request.args || [],
        status === 'completed' ? 'allowed' : 'failed',
        undefined,
        code || undefined,
        duration
      );

      logger.info(`Command completed: ${request.command}`, {
        id,
        status,
        exitCode: code,
        duration,
      });

      resolve(result);
    });

    // Handle error
    childProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      activeCommands.delete(id);

      const duration = Date.now() - startTime;

      const result: CommandResult = {
        id,
        command: request.command,
        args: request.args || [],
        status: 'failed',
        exitCode: 1,
        stdout,
        stderr: error.message,
        duration,
        timestamp: new Date().toISOString(),
        timedOut: false,
        killed: false,
      };

      commandHistory.unshift(result);
      addAuditEntry(request.command, request.args || [], 'failed', error.message, 1, duration);

      logger.error(`Command failed: ${request.command}`, { id, error: error.message });
      resolve(result);
    });
  });
}

/**
 * Kill a running command
 */
export function killCommand(id: string): boolean {
  const process = activeCommands.get(id);

  if (process) {
    process.kill('SIGTERM');
    activeCommands.delete(id);
    logger.info(`Command killed: ${id}`);
    return true;
  }

  return false;
}

/**
 * Get command history
 */
export function getCommandHistory(
  page: number = 1,
  limit: number = 20
): CommandHistory {
  const startIndex = (page - 1) * limit;
  const paginatedCommands = commandHistory.slice(startIndex, startIndex + limit);

  return {
    commands: paginatedCommands,
    total: commandHistory.length,
    page,
    limit,
  };
}

/**
 * Get active commands
 */
export function getActiveCommands(): CommandResult[] {
  const active: CommandResult[] = [];

  activeCommands.forEach((process, id) => {
    active.push({
      id,
      command: process.spawnargs[0] || 'unknown',
      args: process.spawnargs.slice(1),
      status: 'running',
      exitCode: null,
      stdout: '',
      stderr: '',
      duration: Date.now(), // Would need better tracking
      timestamp: new Date().toISOString(),
      timedOut: false,
      killed: false,
    });
  });

  return active;
}

/**
 * Get audit log
 */
export function getAuditLog(
  page: number = 1,
  limit: number = 50
): { entries: ShellAuditEntry[]; total: number } {
  const startIndex = (page - 1) * limit;
  const paginatedEntries = auditLog.slice(startIndex, startIndex + limit);

  return {
    entries: paginatedEntries,
    total: auditLog.length,
  };
}

/**
 * Clear history
 */
export function clearHistory(): void {
  commandHistory.length = 0;
  logger.info('Command history cleared');
}

// Helper functions

function generateCommandId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function addAuditEntry(
  command: string,
  args: string[],
  result: ShellAuditEntry['result'],
  reason?: string,
  exitCode?: number,
  duration?: number
): void {
  const entry: ShellAuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    command,
    args,
    result,
    reason,
    exitCode,
    duration,
  };

  auditLog.unshift(entry);

  // Keep only last 1000 entries
  if (auditLog.length > 1000) {
    auditLog.pop();
  }
}
