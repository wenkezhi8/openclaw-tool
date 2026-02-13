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
  origin: (origin: string, callback: (err: Error | null, allow: boolean) => void) => {
    // In development, allow all origins
    // In production, configure CORS_ORIGIN environment variable
    if (process.env.NODE_ENV === 'development' || !process.env.CORS_ORIGIN) {
      // Allow all common local development origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://[::1]:3000',
      ];
      // Also allow any localhost/127.0.0.1 port variations
      const isLocalOrigin = origin && (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://[::1]:') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.')
      );
      if (allowedOrigins.includes(origin) || isLocalOrigin) {
        callback(null, true);
      } else if (origin) {
        // In development, allow any origin for flexibility
        callback(null, true);
      } else {
        callback(null, true);
      }
    } else {
      // Production: only allow configured origin
      const allowedOrigins = process.env.CORS_ORIGIN!.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    }
  },
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
    name: 'OpenClaw Tool API',
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
  logger.info(`OpenClaw Tool API server running on port ${PORT}`);
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
