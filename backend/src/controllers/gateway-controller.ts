import { Response } from 'express';
import * as gatewayService from '../services/cli/gateway-service';
import * as openclawConfigService from '../services/cli/openclaw-config-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * Get Gateway Status
 */
export const getGatewayStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const status = await gatewayService.getGatewayStatus();
  res.json({ success: true, data: status });
});

/**
 * Start Gateway
 */
export const startGateway = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const options = {
    port: req.body.port,
    workers: req.body.workers,
  };

  const result = await gatewayService.startGateway(options);

  if (result.status === 'error') {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: 'Failed to start gateway',
        details: { lastError: result.lastError },
      },
    });
    return;
  }

  res.json({
    success: true,
    data: { ...result, message: 'Gateway started successfully' },
  });
});

/**
 * Stop Gateway
 */
export const stopGateway = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await gatewayService.stopGateway();

  if (result.status === 'error') {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: 'Failed to stop gateway',
        details: { lastError: result.lastError },
      },
    });
    return;
  }

  res.json({
    success: true,
    data: { ...result, message: 'Gateway stopped successfully' },
  });
});

/**
 * Restart Gateway
 */
export const restartGateway = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const options = {
    port: req.body.port,
    workers: req.body.workers,
  };

  const result = await gatewayService.restartGateway(options);

  if (result.status === 'error') {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: 'Failed to restart gateway',
        details: { lastError: result.lastError },
      },
    });
    return;
  }

  res.json({
    success: true,
    data: { ...result, message: 'Gateway restarted successfully' },
  });
});

/**
 * Get Gateway Metrics
 */
export const getGatewayMetrics = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const metrics = await gatewayService.getGatewayMetrics();
  res.json({ success: true, data: metrics });
});

/**
 * Install Gateway Service
 */
export const installGateway = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await gatewayService.installGateway();

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INSTALL_FAILED',
        message: result.message,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: { message: result.message },
  });
});

/**
 * Check if Gateway Service is Installed
 */
export const checkGatewayInstalled = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const isInstalled = await gatewayService.isGatewayServiceInstalled();
  res.json({ success: true, data: { installed: isInstalled } });
});

/**
 * Get Gateway Dashboard URL
 */
export const getGatewayDashboard = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = await openclawConfigService.getGatewayConfig();

  if (!config) {
    res.json({
      success: true,
      data: {
        port: null,
        token: null,
        dashboardUrl: null,
        message: 'OpenClaw configuration not found',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: config,
  });
});

/**
 * Update Gateway Configuration
 */
export const updateGatewayConfiguration = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { port, token, restart } = req.body;

  const result = await openclawConfigService.updateGatewayConfig({ port, token });

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: result.message,
      },
    });
    return;
  }

  // Restart gateway if requested
  if (restart) {
    const restartResult = await gatewayService.restartGateway(port ? { port } : undefined);
    if (restartResult.status === 'error') {
      res.json({
        success: true,
        data: {
          message: 'Configuration saved, but gateway restart failed',
          restartError: restartResult.lastError,
        },
      });
      return;
    }
  }

  res.json({
    success: true,
    data: {
      message: restart ? 'Configuration saved and gateway restarted' : 'Configuration saved',
    },
  });
});
