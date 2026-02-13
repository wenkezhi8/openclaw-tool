import { Router } from 'express';
import * as memoryController from '../controllers/memory-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/memory - Get memory status overview
router.get('/', readRateLimit, memoryController.getMemoryStatus);

// GET /api/memory/soul - Get SOUL layer configuration
router.get('/soul', readRateLimit, memoryController.getSoulConfig);

// GET /api/memory/user - Get user memory list
router.get('/user', readRateLimit, memoryController.getUserMemory);

// GET /api/memory/user/:id - Get specific user memory
router.get('/user/:id', readRateLimit, memoryController.getUserMemoryById);

// DELETE /api/memory/user/:id - Clear specific user memory
router.delete('/user/:id', agentRateLimit, memoryController.clearUserMemory);

// GET /api/memory/search - Search memory
router.get('/search', readRateLimit, memoryController.searchMemory);

// DELETE /api/memory/clear - Clear memory (bulk)
router.delete('/clear', agentRateLimit, memoryController.clearMemory);

// POST /api/memory/backup - Backup memory to file
router.post('/backup', agentRateLimit, memoryController.backupMemory);

export default router;
