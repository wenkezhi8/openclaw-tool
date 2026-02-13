import { Router } from 'express';
import * as channelsController from '../controllers/channels-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/channels - List channels
router.get('/', readRateLimit, channelsController.listChannels);

// GET /api/channels/:id - Get channel details
router.get('/:id', readRateLimit, channelsController.getChannel);

// POST /api/channels - Add new channel
router.post('/', agentRateLimit, channelsController.addChannel);

// POST /api/channels/:id/test - Test channel connection
router.post('/:id/test', agentRateLimit, channelsController.testChannel);

// PUT /api/channels/:id - Update channel
router.put('/:id', agentRateLimit, channelsController.updateChannel);

// DELETE /api/channels/:id - Delete channel
router.delete('/:id', agentRateLimit, channelsController.deleteChannel);

export default router;
