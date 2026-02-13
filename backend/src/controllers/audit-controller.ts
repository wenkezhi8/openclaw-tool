import { Response } from 'express';
import * as auditService from '../services/audit/audit-service';
import { asyncHandler } from '../middleware/async-handler';
import type { Request } from 'express';
import type { AuditLogFilter } from '../types/audit';

/**
 * Get Audit Log
 * GET /api/audit
 */
export const getAuditLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filter: AuditLogFilter = {
    action: req.query.action as AuditLogFilter['action'],
    result: req.query.result as AuditLogFilter['result'],
    userId: req.query.userId as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
  };

  const result = auditService.getAuditLog(filter);

  res.json({ success: true, data: result });
});

/**
 * Get Audit Summary
 * GET /api/audit/summary
 */
export const getAuditSummary = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const summary = auditService.getAuditSummary();

  res.json({ success: true, data: summary });
});

/**
 * Clear Audit Log
 * DELETE /api/audit
 */
export const clearAuditLog = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const result = auditService.clearAuditLog();

  res.json({ success: true, data: { message: `Cleared ${result.cleared} audit entries` } });
});

/**
 * Export Audit Log
 * GET /api/audit/export
 */
export const exportAuditLog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const format = (req.query.format as 'json' | 'csv') || 'json';

  const filePath = auditService.exportAuditLog(format);

  res.json({ success: true, data: { filePath, message: 'Audit log exported successfully' } });
});
