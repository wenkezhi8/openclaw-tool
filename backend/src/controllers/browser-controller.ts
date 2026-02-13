import { Response } from 'express';
import { browserService } from '../services/browser';
import * as pageOps from '../services/browser/page-operations';
import { asyncHandler } from '../middleware/async-handler';
import { logger } from '../services/logger';
import type { Request } from 'express';
import type {
  CreateSessionOptions,
  NavigateOptions,
  ClickOptions,
  FillOptions,
  ExtractOptions,
  ScreenshotOptions,
  WaitForSelectorOptions,
} from '../types/browser';

/**
 * Create a new browser session
 */
export const createSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const options: CreateSessionOptions = {
    headless: req.body.headless,
    viewport: req.body.viewport,
    timeout: req.body.timeout,
  };

  logger.info('Creating browser session', options);

  const session = await browserService.launchBrowser(options);

  res.status(201).json({
    success: true,
    data: session,
  });
});

/**
 * Get all browser sessions
 */
export const getSessions = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const sessions = browserService.getActiveSessions();

  res.json({
    success: true,
    data: sessions,
  });
});

/**
 * Get a single browser session
 */
export const getSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const session = browserService.getSessionInfo(id);

  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: session,
  });
});

/**
 * Close a browser session
 */
export const closeSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if session exists first
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Closing browser session: ${id}`);

  try {
    await browserService.closeBrowser(id);
    res.json({
      success: true,
      data: { message: 'Session closed successfully' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to close session: ${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'CLOSE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Navigate to URL
 */
export const navigate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const options: NavigateOptions = {
    url: req.body.url,
    waitUntil: req.body.waitUntil,
    timeout: req.body.timeout,
  };

  if (!options.url) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'URL is required',
      },
    });
    return;
  }

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  // Check URL whitelist/blacklist
  if (!browserService.checkUrlAllowed(options.url)) {
    res.status(403).json({
      success: false,
      error: {
        code: 'URL_NOT_ALLOWED',
        message: 'URL is not allowed by policy',
      },
    });
    return;
  }

  logger.info(`Navigate request: session=${id}`, { url: options.url });

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.navigate(page, options);

    if (result.success && result.data) {
      browserService.updateSessionCurrentPage(id, result.data.url);
    }

    res.json({
      success: result.success,
      data: result.data,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Navigate failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'NAVIGATE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Take screenshot
 */
export const screenshot = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const options: ScreenshotOptions = {
    fullPage: req.body.fullPage,
    selector: req.body.selector,
    type: req.body.type,
    quality: req.body.quality,
  };

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Screenshot request: session=${id}`, options);

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.screenshot(page, options);

    res.json({
      success: result.success,
      data: result.data,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Screenshot failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'SCREENSHOT_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Click element
 */
export const click = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const options: ClickOptions = {
    selector: req.body.selector,
    button: req.body.button,
    clickCount: req.body.clickCount,
    delay: req.body.delay,
    timeout: req.body.timeout,
  };

  if (!options.selector) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Selector is required',
      },
    });
    return;
  }

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Click request: session=${id}`, { selector: options.selector });

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.click(page, options);

    browserService.updateSessionStatus(id, 'active');

    res.json({
      success: result.success,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Click failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'CLICK_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Fill form field
 */
export const fill = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const options: FillOptions = {
    selector: req.body.selector,
    value: req.body.value,
    delay: req.body.delay,
    timeout: req.body.timeout,
    clearFirst: req.body.clearFirst,
  };

  if (!options.selector || options.value === undefined) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Selector and value are required',
      },
    });
    return;
  }

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Fill request: session=${id}`, { selector: options.selector });

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.fill(page, options);

    browserService.updateSessionStatus(id, 'active');

    res.json({
      success: result.success,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Fill failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'FILL_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Extract data from page
 */
export const extract = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const options: ExtractOptions = {
    selector: req.body.selector,
    attribute: req.body.attribute,
    multiple: req.body.multiple,
  };

  if (!options.selector) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Selector is required',
      },
    });
    return;
  }

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Extract request: session=${id}`, { selector: options.selector });

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.extract(page, options);

    res.json({
      success: result.success,
      data: result.data,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Extract failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'EXTRACT_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Wait for selector
 */
export const waitForSelector = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const options: WaitForSelectorOptions = {
    selector: req.body.selector,
    state: req.body.state,
    timeout: req.body.timeout,
  };

  if (!options.selector) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Selector is required',
      },
    });
    return;
  }

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Wait for selector request: session=${id}`, { selector: options.selector });

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.waitForSelector(page, options);

    res.json({
      success: result.success,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Wait for selector failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'WAIT_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Get page content
 */
export const getPageContent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Get page content request: session=${id}`);

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.getPageContent(page);

    res.json({
      success: result.success,
      data: result.data,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Get page content failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTENT_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Execute JavaScript
 */
export const evaluate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { script } = req.body;

  if (!script) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Script is required',
      },
    });
    return;
  }

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Evaluate script request: session=${id}`);

  try {
    const { page } = await browserService.getOrCreatePage(id);
    const result = await pageOps.evaluate(page, script);

    res.json({
      success: result.success,
      data: result.data,
      error: result.error ? { message: result.error } : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Evaluate failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'EVALUATE_FAILED',
        message: errorMessage,
      },
    });
  }
});

/**
 * Create new page
 */
export const createPage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Check if session exists
  const session = browserService.getSessionInfo(id);
  if (!session) {
    res.status(404).json({
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Browser session not found: ${id}`,
      },
    });
    return;
  }

  logger.info(`Create page request: session=${id}`);

  try {
    const pageId = await browserService.newPage(id);

    res.status(201).json({
      success: true,
      data: { pageId },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Create page failed: session=${id}`, { error: errorMessage });
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PAGE_FAILED',
        message: errorMessage,
      },
    });
  }
});
