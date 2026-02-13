import { Router } from 'express';
import * as gatewayController from '../controllers/gateway-controller';
import { gatewayRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/gateway/status - Get gateway status
router.get('/status', gatewayRateLimit, gatewayController.getGatewayStatus);

// POST /api/gateway/start - Start gateway
router.post('/start', gatewayRateLimit, gatewayController.startGateway);

// POST /api/gateway/stop - Stop gateway
router.post('/stop', gatewayRateLimit, gatewayController.stopGateway);

// POST /api/gateway/restart - Restart gateway
router.post('/restart', gatewayRateLimit, gatewayController.restartGateway);

// GET /api/gateway/metrics - Get gateway metrics
router.get('/metrics', gatewayRateLimit, gatewayController.getGatewayMetrics);

// POST /api/gateway/install - Install gateway service
router.post('/install', gatewayRateLimit, gatewayController.installGateway);

// GET /api/gateway/installed - Check if gateway service is installed
router.get('/installed', gatewayRateLimit, gatewayController.checkGatewayInstalled);

// GET /api/gateway/dashboard - Get gateway dashboard URL
router.get('/dashboard', gatewayRateLimit, gatewayController.getGatewayDashboard);

// PUT /api/gateway/config - Update gateway configuration
router.put('/config', gatewayRateLimit, gatewayController.updateGatewayConfiguration);

export default router;
