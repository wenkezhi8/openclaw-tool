import { Response } from 'express';
import * as heartbeatService from '../services/heartbeat/heartbeat-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';
import type {
  UpdateHeartbeatConfigRequest,
  CreateHeartbeatTaskRequest,
  UpdateHeartbeatTaskRequest,
} from '../types/heartbeat';

/**
 * Validate schedule format
 * Supports simple interval format: "30m", "1h", "1d" (number + unit)
 */
function isValidSchedule(schedule: string): boolean {
  // Simple interval format: <number><unit> where unit is m, h, or d
  const intervalRegex = /^(\d+)([mhd])$/;

  if (intervalRegex.test(schedule)) {
    const match = schedule.match(intervalRegex);
    if (match) {
      const value = parseInt(match[1], 10);
      // Validate reasonable ranges
      if (match[2] === 'm' && value >= 1 && value <= 1440) return true; // 1 min to 1 day
      if (match[2] === 'h' && value >= 1 && value <= 168) return true;  // 1 hour to 1 week
      if (match[2] === 'd' && value >= 1 && value <= 365) return true;  // 1 day to 1 year
    }
  }

  return false;
}

/**
 * Get Heartbeat Configuration
 * GET /api/heartbeat
 */
export const getHeartbeatConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = await heartbeatService.getHeartbeatConfig();

  res.json({ success: true, data: config });
});

/**
 * Update Heartbeat Configuration
 * PUT /api/heartbeat
 */
export const updateHeartbeatConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const updates: UpdateHeartbeatConfigRequest = req.body;

  const config = await heartbeatService.updateHeartbeatConfig(updates);

  res.json({ success: true, data: config });
});

/**
 * Get Tasks List
 * GET /api/heartbeat/tasks
 */
export const getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const result = await heartbeatService.getTasks(page, limit);

  res.json({ success: true, data: result });
});

/**
 * Get Task by ID
 * GET /api/heartbeat/tasks/:id
 */
export const getTaskById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const task = await heartbeatService.getTaskById(req.params.id);

  if (!task) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Task not found',
      },
    });
    return;
  }

  res.json({ success: true, data: task });
});

/**
 * Add Task
 * POST /api/heartbeat/tasks
 */
export const addTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: CreateHeartbeatTaskRequest = {
    title: req.body.title,
    description: req.body.description,
    schedule: req.body.schedule,
    enabled: req.body.enabled,
  };

  if (!request.title || !request.schedule) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Title and schedule are required',
      },
    });
    return;
  }

  // Validate schedule format
  if (!isValidSchedule(request.schedule)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SCHEDULE',
        message: 'Invalid schedule format. Use format like "30m", "1h", "1d" (minutes, hours, days)',
      },
    });
    return;
  }

  const task = await heartbeatService.addTask(request);

  res.status(201).json({ success: true, data: task });
});

/**
 * Update Task
 * PUT /api/heartbeat/tasks/:id
 */
export const updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: UpdateHeartbeatTaskRequest = req.body;

  // Validate schedule format if provided
  if (request.schedule && !isValidSchedule(request.schedule)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_SCHEDULE',
        message: 'Invalid schedule format. Use format like "30m", "1h", "1d" (minutes, hours, days)',
      },
    });
    return;
  }

  const task = await heartbeatService.updateTask(req.params.id, request);

  if (!task) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Task not found',
      },
    });
    return;
  }

  res.json({ success: true, data: task });
});

/**
 * Delete Task
 * DELETE /api/heartbeat/tasks/:id
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const deleted = await heartbeatService.deleteTask(req.params.id);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Task not found',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Task deleted successfully' } });
});

/**
 * Trigger Heartbeat Manually
 * POST /api/heartbeat/trigger
 */
export const triggerHeartbeat = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await heartbeatService.triggerHeartbeat();

  res.json({ success: true, data: result });
});

/**
 * Execute Single Task
 * POST /api/heartbeat/tasks/:id/execute
 */
export const executeTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await heartbeatService.executeTask(req.params.id);

  if (!result) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Task not found',
      },
    });
    return;
  }

  res.json({ success: true, data: result });
});
