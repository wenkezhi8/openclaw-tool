import { Router } from 'express';
import * as messagingChannelsController from '../controllers/messaging-channels-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/messaging-channels - List messaging channels
router.get('/', readRateLimit, messagingChannelsController.listMessagingChannels);

// GET /api/messaging-channels/:id - Get messaging channel details
router.get('/:id', readRateLimit, messagingChannelsController.getMessagingChannel);

// POST /api/messaging-channels - Add new messaging channel
router.post('/', agentRateLimit, messagingChannelsController.addMessagingChannel);

// PUT /api/messaging-channels/:id - Update messaging channel
router.put('/:id', agentRateLimit, messagingChannelsController.updateMessagingChannel);

// DELETE /api/messaging-channels/:id - Delete messaging channel
router.delete('/:id', agentRateLimit, messagingChannelsController.deleteMessagingChannel);

// POST /api/messaging-channels/:id/connect - Connect/Pair messaging channel
router.post('/:id/connect', agentRateLimit, messagingChannelsController.connectMessagingChannel);

// POST /api/messaging-channels/:id/disconnect - Disconnect messaging channel
router.post('/:id/disconnect', agentRateLimit, messagingChannelsController.disconnectMessagingChannel);

export default router;
