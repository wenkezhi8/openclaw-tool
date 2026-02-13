import { Router } from 'express';
import * as heartbeatController from '../controllers/heartbeat-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/heartbeat - Get heartbeat configuration
router.get('/', readRateLimit, heartbeatController.getHeartbeatConfig);

// PUT /api/heartbeat - Update heartbeat configuration
router.put('/', agentRateLimit, heartbeatController.updateHeartbeatConfig);

// GET /api/heartbeat/tasks - Get tasks list
router.get('/tasks', readRateLimit, heartbeatController.getTasks);

// POST /api/heartbeat/tasks - Add new task
router.post('/tasks', agentRateLimit, heartbeatController.addTask);

// GET /api/heartbeat/tasks/:id - Get task by ID
router.get('/tasks/:id', readRateLimit, heartbeatController.getTaskById);

// PUT /api/heartbeat/tasks/:id - Update task
router.put('/tasks/:id', agentRateLimit, heartbeatController.updateTask);

// DELETE /api/heartbeat/tasks/:id - Delete task
router.delete('/tasks/:id', agentRateLimit, heartbeatController.deleteTask);

// POST /api/heartbeat/tasks/:id/execute - Execute single task
router.post('/tasks/:id/execute', agentRateLimit, heartbeatController.executeTask);

// POST /api/heartbeat/trigger - Trigger heartbeat manually
router.post('/trigger', agentRateLimit, heartbeatController.triggerHeartbeat);

export default router;
