import { Router, Request, Response } from 'express';
import { wsService } from '../services/websocket-service';
import { checkOpenClawInstalled } from '../services/cli/openclaw-wrapper';

const router = Router();

// GET /health - Health check endpoint
router.get('/', async (_req: Request, res: Response) => {
  const openclawInstalled = await checkOpenClawInstalled();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: {
      websocket: wsService.getClientsCount(),
    },
    openclaw: {
      installed: openclawInstalled,
    },
  });
});

// GET /health/ready - Readiness check
router.get('/ready', (_req: Request, res: Response) => {
  res.json({ status: 'ready' });
});

// GET /health/live - Liveness check
router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

export default router;
