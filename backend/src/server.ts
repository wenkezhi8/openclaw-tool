import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './services/logger';
import { errorHandler } from './middleware/error-handler';
import { wsService } from './services/websocket-service';

// Routes
import gatewayRoutes from './routes/gateway-routes';
import agentsRoutes from './routes/agents-routes';
import channelsRoutes from './routes/channels-routes';
import modelsRoutes from './routes/models-routes';
import installRoutes from './routes/install-routes';
import healthRoutes from './routes/health-routes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((_req: Request, _res: Response, next) => {
  logger.debug(`${_req.method} ${_req.path}`, {
    query: _req.query,
    ip: _req.ip,
  });
  next();
});

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// API routes
app.use('/api/gateway', gatewayRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/install', installRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'OpenClaw Manager API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: {
        gateway: '/api/gateway/*',
        agents: '/api/agents/*',
        channels: '/api/channels/*',
        models: '/api/models/*',
        install: '/api/install/*',
      },
      websocket: '/ws',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize WebSocket service
wsService.initialize(server);

// Start server
server.listen(PORT, () => {
  logger.info(`OpenClaw Manager API server running on port ${PORT}`);
  logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  wsService.closeAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  wsService.closeAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Export for testing
export { app, server };
