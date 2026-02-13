import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import type {
  HeartbeatConfig,
  HeartbeatTask,
  HeartbeatTaskListResponse,
  CreateHeartbeatTaskRequest,
  UpdateHeartbeatTaskRequest,
  TriggerHeartbeatResult,
  UpdateHeartbeatConfigRequest,
  TaskExecutionResult,
} from '../../types/heartbeat';

// Default paths
const DEFAULT_HEARTBEAT_PATH = path.join(process.cwd(), 'HEARTBEAT.md');
const DEFAULT_TASKS_PATH = path.join(process.cwd(), 'heartbeat-tasks.json');

// In-memory state
let currentConfig: HeartbeatConfig = {
  enabled: true,
  interval: 30,
  autoExecute: true,
  notifyOnComplete: false,
  retryOnFailure: true,
  maxRetries: 3,
};

let tasks: HeartbeatTask[] = [];
let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Initialize heartbeat service
 */
export function initializeHeartbeat(): void {
  loadTasks();
  loadConfig();

  if (currentConfig.enabled) {
    startHeartbeat();
  }

  logger.info('Heartbeat service initialized', {
    enabled: currentConfig.enabled,
    interval: currentConfig.interval,
    tasksCount: tasks.length,
  });
}

/**
 * Get heartbeat configuration
 */
export async function getHeartbeatConfig(): Promise<HeartbeatConfig> {
  return { ...currentConfig };
}

/**
 * Update heartbeat configuration
 */
export async function updateHeartbeatConfig(
  updates: UpdateHeartbeatConfigRequest
): Promise<HeartbeatConfig> {
  const previousEnabled = currentConfig.enabled;

  currentConfig = {
    ...currentConfig,
    ...updates,
  };

  // Handle enable/disable changes
  if (updates.enabled !== undefined) {
    if (updates.enabled && !previousEnabled) {
      startHeartbeat();
    } else if (!updates.enabled && previousEnabled) {
      stopHeartbeat();
    }
  }

  // Handle interval changes
  if (updates.interval !== undefined && currentConfig.enabled) {
    stopHeartbeat();
    startHeartbeat();
  }

  saveConfig();
  logger.info('Heartbeat config updated', { config: currentConfig });

  return { ...currentConfig };
}

/**
 * Get tasks list
 */
export async function getTasks(
  page: number = 1,
  limit: number = 20
): Promise<HeartbeatTaskListResponse> {
  const total = tasks.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedTasks = tasks.slice(startIndex, startIndex + limit);

  return {
    tasks: paginatedTasks,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<HeartbeatTask | null> {
  return tasks.find((task) => task.id === id) || null;
}

/**
 * Add new task
 */
export async function addTask(request: CreateHeartbeatTaskRequest): Promise<HeartbeatTask> {
  const now = new Date().toISOString();
  const nextRun = calculateNextRun(request.schedule);

  const task: HeartbeatTask = {
    id: generateTaskId(),
    title: request.title,
    description: request.description,
    schedule: request.schedule,
    enabled: request.enabled ?? true,
    status: 'pending',
    nextRun,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  saveTasks();

  logger.info('Heartbeat task added', { taskId: task.id, title: task.title });

  return task;
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  request: UpdateHeartbeatTaskRequest
): Promise<HeartbeatTask | null> {
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return null;
  }

  const task = tasks[taskIndex];
  const updatedTask: HeartbeatTask = {
    ...task,
    ...request,
    nextRun: request.schedule ? calculateNextRun(request.schedule) : task.nextRun,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  saveTasks();

  logger.info('Heartbeat task updated', { taskId: id });

  return updatedTask;
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<boolean> {
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  saveTasks();

  logger.info('Heartbeat task deleted', { taskId: id });

  return true;
}

/**
 * Trigger heartbeat manually
 */
export async function triggerHeartbeat(): Promise<TriggerHeartbeatResult> {
  logger.info('Manual heartbeat triggered');

  const result = await executeHeartbeat();

  return result;
}

/**
 * Execute a single task by ID
 */
export async function executeTask(id: string): Promise<TaskExecutionResult | null> {
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return null;
  }

  const result = await runTask(task);

  // Update task with result
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      lastRun: new Date().toISOString(),
      lastResult: result,
      nextRun: calculateNextRun(task.schedule),
      status: result.success ? 'completed' : 'failed',
    };
    saveTasks();
  }

  return result;
}

// Private helper functions

function startHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  const intervalMs = currentConfig.interval * 60 * 1000;

  heartbeatInterval = setInterval(async () => {
    if (currentConfig.enabled && currentConfig.autoExecute) {
      logger.debug('Automatic heartbeat executing');
      await executeHeartbeat();
    }
  }, intervalMs);

  currentConfig.nextHeartbeat = new Date(Date.now() + intervalMs).toISOString();
  logger.info(`Heartbeat started with interval ${currentConfig.interval} minutes`);
}

function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  currentConfig.nextHeartbeat = undefined;
  logger.info('Heartbeat stopped');
}

async function executeHeartbeat(): Promise<TriggerHeartbeatResult> {
  const now = new Date().toISOString();
  const executedTasks: string[] = [];
  const results: Record<string, TaskExecutionResult> = {};

  currentConfig.lastHeartbeat = now;
  saveConfig();

  // Find tasks that need to run
  const tasksToRun = tasks.filter((task) => {
    if (!task.enabled) return false;
    if (!task.nextRun) return true;
    return new Date(task.nextRun) <= new Date();
  });

  for (const task of tasksToRun) {
    try {
      const result = await runTask(task);
      executedTasks.push(task.id);
      results[task.id] = result;

      // Update task
      const taskIndex = tasks.findIndex((t) => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          lastRun: now,
          lastResult: result,
          nextRun: calculateNextRun(task.schedule),
          status: result.success ? 'completed' : 'failed',
        };
      }
    } catch (error) {
      logger.error(`Failed to execute task ${task.id}`, { error });
      results[task.id] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        timestamp: now,
      };
    }
  }

  saveTasks();

  return {
    success: true,
    executedTasks,
    results,
    timestamp: now,
  };
}

async function runTask(task: HeartbeatTask): Promise<TaskExecutionResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    logger.info(`Executing heartbeat task: ${task.title}`, { taskId: task.id });

    // Update task status to running
    const taskIndex = tasks.findIndex((t) => t.id === task.id);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'running';
    }

    // Simulate task execution - in real implementation, this would:
    // 1. Check HEARTBEAT.md for scheduled tasks
    // 2. Execute the appropriate commands
    // 3. Log results
    await new Promise((resolve) => setTimeout(resolve, 100));

    const duration = Date.now() - startTime;

    return {
      success: true,
      output: `Task "${task.title}" completed successfully`,
      duration,
      timestamp,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      timestamp,
    };
  }
}

function calculateNextRun(schedule: string): string {
  const now = new Date();

  // Parse simple interval format (e.g., "30m", "1h", "1d")
  const match = schedule.match(/^(\d+)([mhd])$/);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000).toISOString();
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000).toISOString();
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  // Default to 30 minutes if can't parse
  return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
}

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadTasks(): void {
  try {
    const tasksPath = process.env.HEARTBEAT_TASKS_PATH || DEFAULT_TASKS_PATH;

    if (fs.existsSync(tasksPath)) {
      const content = fs.readFileSync(tasksPath, 'utf-8');
      tasks = JSON.parse(content);
      logger.info(`Loaded ${tasks.length} heartbeat tasks`);
    }
  } catch (error) {
    logger.warn('Failed to load heartbeat tasks, starting fresh', { error });
    tasks = [];
  }
}

function saveTasks(): void {
  try {
    const tasksPath = process.env.HEARTBEAT_TASKS_PATH || DEFAULT_TASKS_PATH;
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    logger.error('Failed to save heartbeat tasks', { error });
  }
}

function loadConfig(): void {
  try {
    const heartbeatPath = process.env.HEARTBEAT_PATH || DEFAULT_HEARTBEAT_PATH;

    if (fs.existsSync(heartbeatPath)) {
      const content = fs.readFileSync(heartbeatPath, 'utf-8');

      // Try to parse as JSON first
      try {
        const config = JSON.parse(content);
        currentConfig = { ...currentConfig, ...config };
      } catch {
        // If not JSON, try to parse from markdown
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('interval:') || line.includes('Interval:')) {
            const match = line.match(/(\d+)/);
            if (match) {
              currentConfig.interval = parseInt(match[1], 10);
            }
          }
          if (line.includes('enabled:') || line.includes('Enabled:')) {
            if (line.includes('true') || line.includes('yes')) {
              currentConfig.enabled = true;
            } else if (line.includes('false') || line.includes('no')) {
              currentConfig.enabled = false;
            }
          }
        }
      }
    }
  } catch (error) {
    logger.warn('Failed to load heartbeat config, using defaults', { error });
  }
}

function saveConfig(): void {
  try {
    const heartbeatPath = process.env.HEARTBEAT_PATH || DEFAULT_HEARTBEAT_PATH;
    fs.writeFileSync(heartbeatPath, JSON.stringify(currentConfig, null, 2));
  } catch (error) {
    logger.error('Failed to save heartbeat config', { error });
  }
}

// Initialize on module load
initializeHeartbeat();
