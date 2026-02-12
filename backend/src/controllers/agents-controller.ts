import { Request, Response } from 'express';
import * as agentsService from '../services/cli/agents-service';
import { asyncHandler } from '../middleware/async-handler';

/**
 * List Agents
 */
export const listAgents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const params = {
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    status: req.query.status as string,
    search: req.query.search as string,
  };

  const result = await agentsService.listAgents(params);
  res.json({ success: true, data: result });
});

/**
 * Get Agent by ID
 */
export const getAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await agentsService.getAgent(req.params.id);

  if (!result.success || !result.data) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: result.error || 'Agent not found',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Create Agent
 */
export const createAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await agentsService.createAgent(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to create agent',
      },
    });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
});

/**
 * Update Agent
 */
export const updateAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await agentsService.updateAgent(req.params.id, req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to update agent',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Delete Agent
 */
export const deleteAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await agentsService.deleteAgent(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to delete agent',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Agent deleted successfully' } });
});
