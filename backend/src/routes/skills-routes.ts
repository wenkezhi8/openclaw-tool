import { Router } from 'express';
import * as skillsController from '../controllers/skills-controller';
import { agentRateLimit, readRateLimit } from '../middleware/rate-limit';

const router = Router();

// GET /api/skills - List installed skills
router.get('/', readRateLimit, skillsController.listSkills);

// GET /api/skills/marketplace - Search ClawHub marketplace
router.get('/marketplace', readRateLimit, skillsController.searchMarketplace);

// GET /api/skills/:id - Get skill details
router.get('/:id', readRateLimit, skillsController.getSkill);

// POST /api/skills/install - Install a skill
router.post('/install', agentRateLimit, skillsController.installSkill);

// DELETE /api/skills/:id - Uninstall skill
router.delete('/:id', agentRateLimit, skillsController.uninstallSkill);

// PUT /api/skills/:id/approve - Update skill approval status
router.put('/:id/approve', agentRateLimit, skillsController.updateSkillApproval);

// PUT /api/skills/:id/toggle - Enable/Disable skill
router.put('/:id/toggle', agentRateLimit, skillsController.toggleSkill);

export default router;
