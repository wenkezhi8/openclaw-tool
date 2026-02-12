import { Router } from 'express';
import * as agentsController from '../controllers/agents-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/agents - List agents
router.get('/', readRateLimit, agentsController.listAgents);

// GET /api/agents/:id - Get agent details
router.get('/:id', readRateLimit, agentsController.getAgent);

// POST /api/agents - Create new agent
router.post('/', agentRateLimit, agentsController.createAgent);

// PUT /api/agents/:id - Update agent
router.put('/:id', agentRateLimit, agentsController.updateAgent);

// DELETE /api/agents/:id - Delete agent
router.delete('/:id', agentRateLimit, agentsController.deleteAgent);

export default router;
