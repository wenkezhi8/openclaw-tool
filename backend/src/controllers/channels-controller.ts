import { Response } from 'express';
import * as channelsService from '../services/cli/channels-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * List Channels
 */
export const listChannels = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await channelsService.listChannels();

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to list channels',
      },
    });
    return;
  }

  res.json({ success: true, data: { channels: result.data } });
});

/**
 * Get Channel by ID
 */
export const getChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await channelsService.getChannel(req.params.id);

  if (!result.success || !result.data) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: result.error || 'Channel not found',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Add Channel
 */
export const addChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await channelsService.addChannel(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to add channel',
      },
    });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
});

/**
 * Update Channel
 */
export const updateChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await channelsService.updateChannel(req.params.id, req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to update channel',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Delete Channel
 */
export const deleteChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await channelsService.deleteChannel(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to delete channel',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Channel deleted successfully' } });
});
