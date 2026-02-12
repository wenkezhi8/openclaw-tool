import { Response } from 'express';
import * as installService from '../services/cli/install-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * Get Installation Status
 */
export const getInstallationStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const status = await installService.getInstallationStatus();
  res.json({ success: true, data: status });
});

/**
 * Install OpenClaw
 */
export const installOpenClaw = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const options = {
    version: _req.body.version,
    force: _req.body.force,
  };

  const result = await installService.installOpenClaw(options);

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to install OpenClaw',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      message: 'Installation started',
      taskId: result.taskId,
    },
  });
});

/**
 * Uninstall OpenClaw
 */
export const uninstallOpenClaw = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await installService.uninstallOpenClaw();

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to uninstall OpenClaw',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: { message: 'Uninstallation started' },
  });
});

/**
 * Update OpenClaw
 */
export const updateOpenClaw = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await installService.updateOpenClaw();

  if (!result.success) {
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: result.error || 'Failed to update OpenClaw',
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      message: 'Update started',
      fromVersion: result.fromVersion,
      toVersion: result.toVersion,
    },
  });
});
