import { Router } from 'express';
import * as auditController from '../controllers/audit-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/audit - Get audit log with filtering
router.get('/', readRateLimit, auditController.getAuditLog);

// GET /api/audit/summary - Get audit summary
router.get('/summary', readRateLimit, auditController.getAuditSummary);

// GET /api/audit/export - Export audit log
router.get('/export', agentRateLimit, auditController.exportAuditLog);

// DELETE /api/audit - Clear audit log
router.delete('/', agentRateLimit, auditController.clearAuditLog);

export default router;
