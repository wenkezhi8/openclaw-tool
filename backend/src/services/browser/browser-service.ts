import puppeteer, { Browser, Page, BrowserContext } from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import type {
  BrowserSession,
  BrowserSessionInfo,
  BrowserSessionStatus,
  CreateSessionOptions,
  BrowserConfig,
} from '../../types/browser';

// Default configuration
const DEFAULT_CONFIG: BrowserConfig = {
  maxSessions: 5,
  defaultTimeout: 30000,
  defaultViewport: {
    width: 1280,
    height: 720,
  },
  headless: true,
};

interface ActiveSession {
  browser: Browser;
  context: BrowserContext;
  pages: Map<string, Page>;
  session: BrowserSession;
}

class BrowserService {
  private config: BrowserConfig;
  private sessions: Map<string, ActiveSession> = new Map();

  constructor(config: Partial<BrowserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BrowserConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if URL is allowed based on whitelist/blacklist
   */
  private isUrlAllowed(url: string): boolean {
    // If whitelist is set, URL must match
    if (this.config.urlWhitelist && this.config.urlWhitelist.length > 0) {
      return this.config.urlWhitelist.some(pattern => {
        try {
          const regex = new RegExp(pattern);
          return regex.test(url);
        } catch {
          return url.includes(pattern);
        }
      });
    }

    // If blacklist is set, URL must not match
    if (this.config.urlBlacklist && this.config.urlBlacklist.length > 0) {
      return !this.config.urlBlacklist.some(pattern => {
        try {
          const regex = new RegExp(pattern);
          return regex.test(url);
        } catch {
          return url.includes(pattern);
        }
      });
    }

    return true;
  }

  /**
   * Launch a new browser session
   */
  async launchBrowser(options: CreateSessionOptions = {}): Promise<BrowserSession> {
    // Check max sessions limit
    if (this.sessions.size >= this.config.maxSessions) {
      throw new Error(`Maximum number of browser sessions (${this.config.maxSessions}) reached`);
    }

    const sessionId = uuidv4();
    const headless = options.headless ?? this.config.headless;
    const viewport = options.viewport ?? this.config.defaultViewport;

    logger.info(`Launching browser session: ${sessionId}`, { headless, viewport });

    try {
      const browser = await puppeteer.launch({
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,720',
        ],
        defaultViewport: viewport,
        timeout: options.timeout ?? this.config.defaultTimeout,
      });

      const context = await browser.createBrowserContext();

      const session: BrowserSession = {
        id: sessionId,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        viewport,
      };

      this.sessions.set(sessionId, {
        browser,
        context,
        pages: new Map(),
        session,
      });

      // Handle browser disconnect
      browser.on('disconnected', () => {
        logger.info(`Browser disconnected: ${sessionId}`);
        this.sessions.delete(sessionId);
      });

      logger.info(`Browser session launched successfully: ${sessionId}`);
      return session;
    } catch (error) {
      logger.error(`Failed to launch browser session: ${sessionId}`, { error });
      throw error;
    }
  }

  /**
   * Close a browser session
   */
  async closeBrowser(sessionId: string): Promise<void> {
    const activeSession = this.sessions.get(sessionId);
    if (!activeSession) {
      throw new Error(`Browser session not found: ${sessionId}`);
    }

    logger.info(`Closing browser session: ${sessionId}`);

    try {
      await activeSession.browser.close();
      this.sessions.delete(sessionId);
      logger.info(`Browser session closed: ${sessionId}`);
    } catch (error) {
      logger.error(`Error closing browser session: ${sessionId}`, { error });
      this.sessions.delete(sessionId);
      throw error;
    }
  }

  /**
   * Create a new page in a session
   */
  async newPage(sessionId: string): Promise<string> {
    const activeSession = this.sessions.get(sessionId);
    if (!activeSession) {
      throw new Error(`Browser session not found: ${sessionId}`);
    }

    const pageId = uuidv4();
    logger.debug(`Creating new page: ${pageId} in session: ${sessionId}`);

    try {
      const page = await activeSession.context.newPage();

      // Set default timeout
      page.setDefaultTimeout(this.config.defaultTimeout);

      // Track page close
      page.on('close', () => {
        logger.debug(`Page closed: ${pageId}`);
        activeSession.pages.delete(pageId);
      });

      // Handle page errors
      page.on('error', (error) => {
        logger.error(`Page error: ${pageId}`, { error });
      });

      // Handle console messages
      page.on('console', (msg) => {
        logger.debug(`Page console [${pageId}]: ${msg.type()} - ${msg.text()}`);
      });

      activeSession.pages.set(pageId, page);
      activeSession.session.lastActivity = new Date().toISOString();

      logger.debug(`Page created successfully: ${pageId}`);
      return pageId;
    } catch (error) {
      logger.error(`Failed to create page: ${pageId}`, { error });
      throw error;
    }
  }

  /**
   * Get active session
   */
  getSession(sessionId: string): ActiveSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get page from session
   */
  getPage(sessionId: string, pageId: string): Page {
    const activeSession = this.sessions.get(sessionId);
    if (!activeSession) {
      throw new Error(`Browser session not found: ${sessionId}`);
    }

    const page = activeSession.pages.get(pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }

    return page;
  }

  /**
   * Get first available page or create one
   */
  async getOrCreatePage(sessionId: string): Promise<{ pageId: string; page: Page }> {
    const activeSession = this.sessions.get(sessionId);
    if (!activeSession) {
      throw new Error(`Browser session not found: ${sessionId}`);
    }

    // Get first existing page
    const [firstEntry] = activeSession.pages.entries();
    if (firstEntry) {
      return { pageId: firstEntry[0], page: firstEntry[1] };
    }

    // Create new page
    const pageId = await this.newPage(sessionId);
    const page = this.getPage(sessionId, pageId);
    return { pageId, page };
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): BrowserSessionInfo[] {
    return Array.from(this.sessions.values()).map((s) => ({
      id: s.session.id,
      status: s.session.status,
      createdAt: s.session.createdAt,
      lastActivity: s.session.lastActivity,
      currentPage: s.session.currentPage,
      pageCount: s.pages.size,
    }));
  }

  /**
   * Get session info
   */
  getSessionInfo(sessionId: string): BrowserSessionInfo | undefined {
    const activeSession = this.sessions.get(sessionId);
    if (!activeSession) return undefined;

    return {
      id: activeSession.session.id,
      status: activeSession.session.status,
      createdAt: activeSession.session.createdAt,
      lastActivity: activeSession.session.lastActivity,
      currentPage: activeSession.session.currentPage,
      pageCount: activeSession.pages.size,
    };
  }

  /**
   * Update session status
   */
  updateSessionStatus(sessionId: string, status: BrowserSessionStatus): void {
    const activeSession = this.sessions.get(sessionId);
    if (activeSession) {
      activeSession.session.status = status;
      activeSession.session.lastActivity = new Date().toISOString();
    }
  }

  /**
   * Update session current page
   */
  updateSessionCurrentPage(sessionId: string, url: string): void {
    const activeSession = this.sessions.get(sessionId);
    if (activeSession) {
      activeSession.session.currentPage = url;
      activeSession.session.lastActivity = new Date().toISOString();
    }
  }

  /**
   * Close all sessions
   */
  async closeAllSessions(): Promise<void> {
    logger.info(`Closing all browser sessions (${this.sessions.size})`);

    const closePromises = Array.from(this.sessions.keys()).map((sessionId) =>
      this.closeBrowser(sessionId).catch((error) => {
        logger.error(`Error closing session ${sessionId}`, { error });
      })
    );

    await Promise.all(closePromises);
    logger.info('All browser sessions closed');
  }

  /**
   * Get sessions count
   */
  getSessionsCount(): number {
    return this.sessions.size;
  }

  /**
   * Check if URL is allowed (public method)
   */
  checkUrlAllowed(url: string): boolean {
    return this.isUrlAllowed(url);
  }
}

// Export singleton instance
export const browserService = new BrowserService();
export { BrowserService };
