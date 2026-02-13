// Shell Command Execution Types (Sandbox Mode)

export interface ShellConfig {
  enabled: boolean;
  timeout: number; // milliseconds
  maxOutputSize: number; // bytes
  allowedCommands: string[]; // whitelist of allowed commands
  blockedCommands: string[]; // blacklist of blocked commands/patterns
  allowedDirectories: string[]; // directories where commands can run
  environmentVariables: Record<string, string>; // allowed env vars
  maxConcurrentCommands: number;
}

export type CommandStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'killed';

export interface CommandRequest {
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

export interface CommandResult {
  id: string;
  command: string;
  args: string[];
  status: CommandStatus;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration: number; // milliseconds
  timestamp: string;
  timedOut: boolean;
  killed: boolean;
}

export interface CommandHistory {
  commands: CommandResult[];
  total: number;
  page: number;
  limit: number;
}

export interface CommandValidation {
  valid: boolean;
  command: string;
  args: string[];
  error?: string;
  sanitizedCommand?: string;
}

export interface ShellSession {
  id: string;
  createdAt: string;
  commands: CommandResult[];
  status: 'active' | 'closed';
}

// CLI response types
export interface CliCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

// Security audit entry
export interface ShellAuditEntry {
  id: string;
  timestamp: string;
  command: string;
  args: string[];
  user?: string;
  ip?: string;
  result: 'allowed' | 'blocked' | 'failed';
  reason?: string;
  exitCode?: number;
  duration?: number;
}
