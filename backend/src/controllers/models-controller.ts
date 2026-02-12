import { Request, Response } from 'express';
import * as modelsService from '../services/cli/models-service';
import { asyncHandler } from '../middleware/async-handler';

/**
 * List Models
 */
export const listModels = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const channel = req.query.channel as string;
  const result = await modelsService.listModels(channel);

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to list models',
      },
    });
    return;
  }

  res.json({ success: true, data: { models: result.data } });
});

/**
 * Get Model by ID
 */
export const getModel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await modelsService.getModel(req.params.id);

  if (!result.success || !result.data) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: result.error || 'Model not found',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Add Model
 */
export const addModel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await modelsService.addModel(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to add model',
      },
    });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
});

/**
 * Delete Model
 */
export const deleteModel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await modelsService.deleteModel(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to delete model',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Model deleted successfully' } });
});
