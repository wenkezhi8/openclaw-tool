import { Router } from 'express';
import * as filesystemController from '../controllers/filesystem-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/fs - List files in directory
router.get('/', readRateLimit, filesystemController.listFiles);

// GET /api/fs/file - Read file content
router.get('/file', readRateLimit, filesystemController.readFile);

// POST /api/fs/file - Write file content
router.post('/file', agentRateLimit, filesystemController.writeFile);

// DELETE /api/fs/file - Delete file
router.delete('/file', agentRateLimit, filesystemController.deleteFile);

// POST /api/fs/directory - Create directory
router.post('/directory', agentRateLimit, filesystemController.createDirectory);

// GET /api/fs/info - Get file info
router.get('/info', readRateLimit, filesystemController.getFileInfo);

// GET /api/fs/config - Get filesystem configuration
router.get('/config', readRateLimit, filesystemController.getConfig);

export default router;
