import { Router } from 'express';
import * as installController from '../controllers/install-controller';
import { gatewayRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/install/status - Get installation status
router.get('/status', readRateLimit, installController.getInstallationStatus);

// POST /api/install - Install OpenClaw
router.post('/', gatewayRateLimit, installController.installOpenClaw);

// DELETE /api/install - Uninstall OpenClaw
router.delete('/', gatewayRateLimit, installController.uninstallOpenClaw);

// POST /api/install/update - Update OpenClaw
router.post('/update', gatewayRateLimit, installController.updateOpenClaw);

export default router;
