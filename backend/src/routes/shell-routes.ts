import { Router } from 'express';
import * as shellController from '../controllers/shell-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/shell/config - Get shell configuration
router.get('/config', readRateLimit, shellController.getConfig);

// POST /api/shell/validate - Validate command (dry run)
router.post('/validate', readRateLimit, shellController.validateCommand);

// POST /api/shell/execute - Execute a command
router.post('/execute', agentRateLimit, shellController.executeCommand);

// POST /api/shell/kill/:id - Kill a running command
router.post('/kill/:id', agentRateLimit, shellController.killCommand);

// GET /api/shell/history - Get command history
router.get('/history', readRateLimit, shellController.getHistory);

// DELETE /api/shell/history - Clear command history
router.delete('/history', agentRateLimit, shellController.clearHistory);

// GET /api/shell/active - Get active commands
router.get('/active', readRateLimit, shellController.getActiveCommands);

// GET /api/shell/audit - Get audit log
router.get('/audit', readRateLimit, shellController.getAuditLog);

export default router;
