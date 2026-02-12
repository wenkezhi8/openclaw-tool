import { spawn, SpawnOptions, ChildProcess } from 'child_process';
import { logger } from '../logger';
import type { CliCommandResult, CliOptions } from '../../types';

const OPENCLAW_COMMAND = 'openclaw';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Execute an OpenClaw CLI command
 */
export async function executeCommand(
  args: string[],
  options: CliOptions = {}
): Promise<CliCommandResult> {
  const { timeout = DEFAULT_TIMEOUT, env = {} } = options;

  return new Promise((resolve) => {
    const spawnOptions: SpawnOptions = {
      env: { ...global.process.env, ...env },
      timeout,
    };

    logger.debug(`Executing: ${OPENCLAW_COMMAND} ${args.join(' ')}`);

    const cliProcess = spawn(OPENCLAW_COMMAND, args, spawnOptions) as ChildProcess;

    let stdout = '';
    let stderr = '';

    cliProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      logger.debug(`[CLI stdout]: ${data.toString().trim()}`);
    });

    cliProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      logger.debug(`[CLI stderr]: ${data.toString().trim()}`);
    });

    cliProcess.on('close', (code) => {
      const result: CliCommandResult = {
        exitCode: code ?? 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };

      if (code !== 0) {
        logger.error(`Command failed with exit code ${code}`, { args, stderr });
      } else {
        logger.debug(`Command succeeded`, { args });
      }

      resolve(result);
    });

    cliProcess.on('error', (error) => {
      logger.error(`Process error: ${error.message}`, { error, args });
      resolve({
        exitCode: -1,
        stdout: '',
        stderr: error.message,
      });
    });
  });
}

/**
 * Execute a command and parse JSON output
 */
export async function executeJsonCommand<T = unknown>(
  args: string[],
  options?: CliOptions
): Promise<{ success: boolean; data?: T; error?: string }> {
  const result = await executeCommand(args, options);

  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr };
  }

  try {
    const data = JSON.parse(result.stdout) as T;
    return { success: true, data };
  } catch (error) {
    logger.error('Failed to parse JSON output', { stdout: result.stdout, error });
    return { success: false, error: 'Failed to parse command output' };
  }
}

/**
 * Execute a command with streaming output
 */
export function executeStreamingCommand(
  args: string[],
  onData: (data: string) => void,
  onError?: (error: string) => void,
  onClose?: (code: number | null) => void
): ChildProcess {
  const streamProcess = spawn(OPENCLAW_COMMAND, args) as ChildProcess;

  streamProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    onData(output);
  });

  streamProcess.stderr?.on('data', (data) => {
    const error = data.toString();
    onError?.(error);
  });

  streamProcess.on('close', (code) => {
    onClose?.(code);
  });

  streamProcess.on('error', (error) => {
    logger.error(`Process error: ${error.message}`, { args });
    onError?.(error.message);
  });

  return streamProcess;
}

/**
 * Check if OpenClaw CLI is available
 */
export async function checkOpenClawInstalled(): Promise<boolean> {
  const result = await executeCommand(['--version'], { timeout: 5000 });
  return result.exitCode === 0;
}
