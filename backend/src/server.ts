import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './services/logger';
import { errorHandler } from './middleware/error-handler';
import { wsService } from './services/websocket-service';
import { browserService } from './services/browser';

// Routes
import gatewayRoutes from './routes/gateway-routes';
import agentsRoutes from './routes/agents-routes';
import channelsRoutes from './routes/channels-routes';
import modelsRoutes from './routes/models-routes';
import installRoutes from './routes/install-routes';
import healthRoutes from './routes/health-routes';
import messagingChannelsRoutes from './routes/messaging-channels-routes';
import skillsRoutes from './routes/skills-routes';
import browserRoutes from './routes/browser-routes';
import memoryRoutes from './routes/memory-routes';
import heartbeatRoutes from './routes/heartbeat-routes';
import filesystemRoutes from './routes/filesystem-routes';
import shellRoutes from './routes/shell-routes';
import auditRoutes from './routes/audit-routes';
import performanceRoutes from './routes/performance-routes';
import { performanceService } from './services/performance/performance-service';

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
app.use('/api/messaging-channels', messagingChannelsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/browser', browserRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/fs', filesystemRoutes);
app.use('/api/shell', shellRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/performance', performanceRoutes);

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
        messagingChannels: '/api/messaging-channels/*',
        skills: '/api/skills/*',
        browser: '/api/browser/*',
        memory: '/api/memory/*',
        heartbeat: '/api/heartbeat/*',
        filesystem: '/api/fs/*',
        shell: '/api/shell/*',
        audit: '/api/audit/*',
        performance: '/api/performance/*',
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

// Start performance monitoring
performanceService.start();

// Start server
server.listen(PORT, () => {
  logger.info(`OpenClaw Manager API server running on port ${PORT}`);
  logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  performanceService.stop();
  wsService.closeAll();
  browserService.closeAllSessions().catch((err) => {
    logger.error('Error closing browser sessions', { error: err });
  });
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  performanceService.stop();
  wsService.closeAll();
  browserService.closeAllSessions().catch((err) => {
    logger.error('Error closing browser sessions', { error: err });
  });
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Export for testing
export { app, server };
