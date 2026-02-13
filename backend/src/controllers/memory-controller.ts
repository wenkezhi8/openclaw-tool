import { Response } from 'express';
import * as memoryService from '../services/memory/memory-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * Get Memory Status
 * GET /api/memory
 */
export const getMemoryStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const status = await memoryService.getMemoryStatus();

  res.json({ success: true, data: status });
});

/**
 * Get Soul Config
 * GET /api/memory/soul
 */
export const getSoulConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = await memoryService.getSoulConfig();

  if (!config) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'SOUL configuration not found',
      },
    });
    return;
  }

  res.json({ success: true, data: config });
});

/**
 * Get User Memory List
 * GET /api/memory/user
 */
export const getUserMemory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const type = req.query.type as 'preference' | 'fact' | 'context' | undefined;

  const result = await memoryService.getUserMemory(page, limit, type);

  res.json({ success: true, data: result });
});

/**
 * Get User Memory by ID
 * GET /api/memory/user/:id
 */
export const getUserMemoryById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const memory = await memoryService.getUserMemoryById(req.params.id);

  if (!memory) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Memory not found',
      },
    });
    return;
  }

  res.json({ success: true, data: memory });
});

/**
 * Clear User Memory
 * DELETE /api/memory/user/:id
 */
export const clearUserMemory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await memoryService.clearMemory({ ids: [req.params.id] });

  res.json({
    success: true,
    data: {
      message: `Deleted ${result.deleted} memory entry`,
      deleted: result.deleted,
    },
  });
});

/**
 * Search Memory
 * GET /api/memory/search
 */
export const searchMemory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;
  const type = req.query.type as 'preference' | 'fact' | 'context' | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  if (!query) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Search query is required',
      },
    });
    return;
  }

  const result = await memoryService.searchMemory({ query, type, limit });

  res.json({ success: true, data: result });
});

/**
 * Clear Memory (bulk)
 * DELETE /api/memory/clear
 */
export const clearMemory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type, before, ids } = req.body;

  if (!type && !before && (!ids || ids.length === 0)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'At least one filter (type, before, or ids) is required',
      },
    });
    return;
  }

  const result = await memoryService.clearMemory({ type, before, ids });

  res.json({
    success: true,
    data: {
      message: `Deleted ${result.deleted} memory entries`,
      deleted: result.deleted,
    },
  });
});

/**
 * Backup Memory
 * POST /api/memory/backup
 */
export const backupMemory = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await memoryService.backupMemory();

  res.status(201).json({ success: true, data: result });
});
