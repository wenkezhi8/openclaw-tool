// Heartbeat Task Types

export interface HeartbeatConfig {
  enabled: boolean;
  interval: number; // minutes
  lastHeartbeat?: string;
  nextHeartbeat?: string;
  autoExecute: boolean;
  notifyOnComplete: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

export type HeartbeatTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'disabled';

export interface HeartbeatTask {
  id: string;
  title: string;
  description: string;
  schedule: string; // cron expression or interval like "30m", "1h"
  enabled: boolean;
  status: HeartbeatTaskStatus;
  lastRun?: string;
  nextRun?: string;
  lastResult?: TaskExecutionResult;
  createdAt: string;
  updatedAt: string;
}

export interface TaskExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  duration: number; // milliseconds
  timestamp: string;
}

export interface HeartbeatTaskListResponse {
  tasks: HeartbeatTask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateHeartbeatTaskRequest {
  title: string;
  description: string;
  schedule: string;
  enabled?: boolean;
}

export interface UpdateHeartbeatTaskRequest {
  title?: string;
  description?: string;
  schedule?: string;
  enabled?: boolean;
}

export interface TriggerHeartbeatResult {
  success: boolean;
  executedTasks: string[];
  results: Record<string, TaskExecutionResult>;
  timestamp: string;
}

export interface UpdateHeartbeatConfigRequest {
  enabled?: boolean;
  interval?: number;
  autoExecute?: boolean;
  notifyOnComplete?: boolean;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

// CLI response types
export interface CliHeartbeatConfig {
  enabled: boolean;
  interval: number;
  lastHeartbeat?: string;
  nextHeartbeat?: string;
}

export interface CliHeartbeatTask {
  id: string;
  title: string;
  description?: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}
