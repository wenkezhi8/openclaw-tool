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

/**
 * Update Model
 */
export const updateModel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await modelsService.updateModel(req.params.id, req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to update model',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Test Model
 */
export const testModel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const modelId = req.params.id;
  const { prompt } = req.body;

  // For now, return a mock test result
  // In a real implementation, this would make an actual API call to test the model
  const result = {
    success: true,
    modelId,
    response: prompt ? `Test response for model ${modelId} with prompt: "${prompt.substring(0, 50)}..."` : 'Connection test successful',
    latency: Math.floor(Math.random() * 500) + 100,
    tokensUsed: {
      prompt: Math.floor(Math.random() * 50) + 10,
      completion: Math.floor(Math.random() * 100) + 20,
      total: 0,
    },
    testedAt: new Date().toISOString(),
  };
  result.tokensUsed.total = result.tokensUsed.prompt + result.tokensUsed.completion;

  res.json({
    success: true,
    data: result,
  });
});
