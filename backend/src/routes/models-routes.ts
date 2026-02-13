import { Router } from 'express';
import * as modelsController from '../controllers/models-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/models - List models
router.get('/', readRateLimit, modelsController.listModels);

// GET /api/models/:id - Get model details
router.get('/:id', readRateLimit, modelsController.getModel);

// POST /api/models - Add new model
router.post('/', agentRateLimit, modelsController.addModel);

// POST /api/models/:id/test - Test model
router.post('/:id/test', agentRateLimit, modelsController.testModel);

// PUT /api/models/:id - Update model
router.put('/:id', agentRateLimit, modelsController.updateModel);

// DELETE /api/models/:id - Delete model
router.delete('/:id', agentRateLimit, modelsController.deleteModel);

export default router;
