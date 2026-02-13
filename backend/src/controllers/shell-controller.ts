import { Response } from 'express';
import * as shellService from '../services/shell/shell-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';
import type { CommandRequest } from '../types/shell';

/**
 * Get Shell Configuration
 * GET /api/shell/config
 */
export const getConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = shellService.getConfig();
  res.json({ success: true, data: config });
});

/**
 * Execute Command
 * POST /api/shell/execute
 */
export const executeCommand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: CommandRequest = {
    command: req.body.command,
    args: req.body.args,
    cwd: req.body.cwd,
    timeout: req.body.timeout,
    env: req.body.env,
  };

  if (!request.command) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Command is required',
      },
    });
    return;
  }

  const result = await shellService.executeCommand(request);

  const statusCode = result.status === 'completed' ? 200 : result.status === 'failed' ? 400 : 200;

  res.status(statusCode).json({ success: result.status === 'completed', data: result });
});

/**
 * Kill Command
 * POST /api/shell/kill/:id
 */
export const killCommand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const killed = shellService.killCommand(req.params.id);

  if (!killed) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Command not found or not running',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Command killed' } });
});

/**
 * Get Command History
 * GET /api/shell/history
 */
export const getHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const result = shellService.getCommandHistory(page, limit);

  res.json({ success: true, data: result });
});

/**
 * Get Active Commands
 * GET /api/shell/active
 */
export const getActiveCommands = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const commands = shellService.getActiveCommands();

  res.json({ success: true, data: { commands, count: commands.length } });
});

/**
 * Get Audit Log
 * GET /api/shell/audit
 */
export const getAuditLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const result = shellService.getAuditLog(page, limit);

  res.json({ success: true, data: result });
});

/**
 * Clear History
 * DELETE /api/shell/history
 */
export const clearHistory = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  shellService.clearHistory();

  res.json({ success: true, data: { message: 'History cleared' } });
});

/**
 * Validate Command (dry run)
 * POST /api/shell/validate
 */
export const validateCommand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const request: CommandRequest = {
    command: req.body.command,
    args: req.body.args,
    cwd: req.body.cwd,
  };

  if (!request.command) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Command is required',
      },
    });
    return;
  }

  const validation = shellService.validateCommand(request);

  res.json({ success: true, data: validation });
});
