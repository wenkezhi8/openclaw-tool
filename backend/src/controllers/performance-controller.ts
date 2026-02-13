import { Response } from 'express';
import { performanceService } from '../services/performance/performance-service';
import { cacheService } from '../services/cache/cache-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * Get Current Performance Snapshot
 * GET /api/performance
 */
export const getPerformance = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const snapshot = performanceService.getCurrentSnapshot();

  res.json({ success: true, data: snapshot });
});

/**
 * Get Performance History
 * GET /api/performance/history
 */
export const getPerformanceHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 60;

  const snapshots = performanceService.getSnapshots(limit);

  res.json({ success: true, data: snapshots });
});

/**
 * Get Metrics
 * GET /api/performance/metrics
 */
export const getMetrics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const name = req.query.name as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

  const metrics = performanceService.getMetrics(name, limit);

  res.json({ success: true, data: metrics });
});

/**
 * Get Cache Stats
 * GET /api/performance/cache
 */
export const getCacheStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const stats = cacheService.getStats();

  res.json({ success: true, data: stats });
});

/**
 * Clear Cache
 * DELETE /api/performance/cache
 */
export const clearCache = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  cacheService.clear();

  res.json({ success: true, data: { message: 'Cache cleared' } });
});

/**
 * Invalidate Cache Pattern
 * POST /api/performance/cache/invalidate
 */
export const invalidateCachePattern = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const pattern = req.body.pattern as string;

  if (!pattern) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Pattern is required',
      },
    });
    return;
  }

  const deleted = cacheService.invalidatePattern(pattern);

  res.json({ success: true, data: { deleted, pattern } });
});

/**
 * Reset Performance Statistics
 * POST /api/performance/reset
 */
export const resetPerformance = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  performanceService.reset();

  res.json({ success: true, data: { message: 'Performance statistics reset' } });
});

/**
 * Get Performance Config
 * GET /api/performance/config
 */
export const getPerformanceConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = performanceService.getConfig();

  res.json({ success: true, data: config });
});
