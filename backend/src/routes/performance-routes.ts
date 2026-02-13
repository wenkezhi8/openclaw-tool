import { Router } from 'express';
import * as performanceController from '../controllers/performance-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/performance - Get current performance snapshot
router.get('/', readRateLimit, performanceController.getPerformance);

// GET /api/performance/history - Get performance history
router.get('/history', readRateLimit, performanceController.getPerformanceHistory);

// GET /api/performance/metrics - Get metrics
router.get('/metrics', readRateLimit, performanceController.getMetrics);

// GET /api/performance/cache - Get cache stats
router.get('/cache', readRateLimit, performanceController.getCacheStats);

// DELETE /api/performance/cache - Clear cache
router.delete('/cache', agentRateLimit, performanceController.clearCache);

// POST /api/performance/cache/invalidate - Invalidate cache pattern
router.post('/cache/invalidate', agentRateLimit, performanceController.invalidateCachePattern);

// POST /api/performance/reset - Reset performance statistics
router.post('/reset', agentRateLimit, performanceController.resetPerformance);

// GET /api/performance/config - Get performance config
router.get('/config', readRateLimit, performanceController.getPerformanceConfig);

export default router;
