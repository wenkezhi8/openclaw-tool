import { Response } from 'express';
import * as diagnosticsService from '../services/diagnostics-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';

/**
 * Run Diagnostics
 */
export const runDiagnostics = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = await diagnosticsService.runDiagnostics();
  res.json({ success: true, data: result });
});
