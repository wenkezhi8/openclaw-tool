import { Router } from 'express';
import * as browserController from '../controllers/browser-controller';
import { browserRateLimit } from '../middleware/rate-limit';

const router = Router();

// Session management
// POST /api/browser/sessions - Create browser session
router.post('/sessions', browserRateLimit, browserController.createSession);

// GET /api/browser/sessions - List all sessions
router.get('/sessions', browserRateLimit, browserController.getSessions);

// GET /api/browser/sessions/:id - Get session details
router.get('/sessions/:id', browserRateLimit, browserController.getSession);

// DELETE /api/browser/sessions/:id - Close session
router.delete('/sessions/:id', browserRateLimit, browserController.closeSession);

// Page operations
// POST /api/browser/sessions/:id/pages - Create new page
router.post('/sessions/:id/pages', browserRateLimit, browserController.createPage);

// POST /api/browser/sessions/:id/navigate - Navigate to URL
router.post('/sessions/:id/navigate', browserRateLimit, browserController.navigate);

// POST /api/browser/sessions/:id/screenshot - Take screenshot
router.post('/sessions/:id/screenshot', browserRateLimit, browserController.screenshot);

// POST /api/browser/sessions/:id/click - Click element
router.post('/sessions/:id/click', browserRateLimit, browserController.click);

// POST /api/browser/sessions/:id/fill - Fill form field
router.post('/sessions/:id/fill', browserRateLimit, browserController.fill);

// POST /api/browser/sessions/:id/extract - Extract data
router.post('/sessions/:id/extract', browserRateLimit, browserController.extract);

// POST /api/browser/sessions/:id/wait - Wait for selector
router.post('/sessions/:id/wait', browserRateLimit, browserController.waitForSelector);

// GET /api/browser/sessions/:id/content - Get page content
router.get('/sessions/:id/content', browserRateLimit, browserController.getPageContent);

// POST /api/browser/sessions/:id/evaluate - Execute JavaScript
router.post('/sessions/:id/evaluate', browserRateLimit, browserController.evaluate);

export default router;
