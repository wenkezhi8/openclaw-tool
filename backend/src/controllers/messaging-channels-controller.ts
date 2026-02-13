import { Response } from 'express';
import * as messagingChannelsService from '../services/cli/messaging-channels-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * List Messaging Channels
 */
export const listMessagingChannels = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.listMessagingChannels();

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to list messaging channels',
      },
    });
    return;
  }

  res.json({ success: true, data: { channels: result.data } });
});

/**
 * Get Messaging Channel by ID
 */
export const getMessagingChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.getMessagingChannel(req.params.id);

  if (!result.success || !result.data) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: result.error || 'Messaging channel not found',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Add Messaging Channel
 */
export const addMessagingChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.addMessagingChannel(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to add messaging channel',
      },
    });
    return;
  }

  res.status(201).json({ success: true, data: result.data });
});

/**
 * Update Messaging Channel
 */
export const updateMessagingChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.updateMessagingChannel(req.params.id, req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to update messaging channel',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Delete Messaging Channel
 */
export const deleteMessagingChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.deleteMessagingChannel(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to delete messaging channel',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Messaging channel deleted successfully' } });
});

/**
 * Connect/Pair Messaging Channel
 */
export const connectMessagingChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.connectMessagingChannel(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PAIRING_FAILED',
        message: result.error || 'Failed to connect messaging channel',
      },
    });
    return;
  }

  res.json({ success: true, data: result.data });
});

/**
 * Disconnect Messaging Channel
 */
export const disconnectMessagingChannel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await messagingChannelsService.disconnectMessagingChannel(req.params.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to disconnect messaging channel',
      },
    });
    return;
  }

  res.json({ success: true, data: { message: 'Messaging channel disconnected successfully' } });
});
