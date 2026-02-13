import { Router } from 'express';
import * as diagnosticsController from '../controllers/diagnostics-controller';

const router = Router();

// GET /api/diagnostics - Run all diagnostics
router.get('/', diagnosticsController.runDiagnostics);

export default router;
