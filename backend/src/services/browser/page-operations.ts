import { Page } from 'puppeteer';
import { logger } from '../logger';
import type {
  NavigateOptions,
  ClickOptions,
  FillOptions,
  ExtractOptions,
  ExtractResult,
  ScreenshotOptions,
  ScreenshotResult,
  WaitForSelectorOptions,
  PageOperationResult,
  ExtractedElement,
} from '../../types/browser';

const DEFAULT_TIMEOUT = 30000;

/**
 * Navigate to URL
 */
export async function navigate(
  page: Page,
  options: NavigateOptions
): Promise<PageOperationResult<{ url: string; title: string }>> {
  const { url, waitUntil = 'load', timeout = DEFAULT_TIMEOUT } = options;

  logger.debug(`Navigating to: ${url}`, { waitUntil, timeout });

  try {
    const response = await page.goto(url, {
      waitUntil: waitUntil === 'networkidle' ? 'networkidle0' : waitUntil,
      timeout,
    });

    const finalUrl = page.url();
    const title = await page.title();

    logger.debug(`Navigation complete: ${finalUrl}`, { title, status: response?.status() });

    return {
      success: true,
      data: { url: finalUrl, title },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Navigation failed: ${url}`, { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Take screenshot
 */
export async function screenshot(
  page: Page,
  options: ScreenshotOptions = {}
): Promise<PageOperationResult<ScreenshotResult>> {
  const { fullPage = false, selector, type = 'png', quality } = options;

  logger.debug('Taking screenshot', { fullPage, selector, type });

  try {
    let screenshotData: Buffer;

    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return {
          success: false,
          error: `Element not found: ${selector}`,
        };
      }
      const uint8Array = await element.screenshot({ type, quality }) as Uint8Array;
      screenshotData = Buffer.from(uint8Array);
    } else {
      const uint8Array = await page.screenshot({
        fullPage,
        type,
        quality,
      }) as Uint8Array;
      screenshotData = Buffer.from(uint8Array);
    }

    // Get viewport dimensions
    const viewport = page.viewport();
    const dimensions = fullPage
      ? await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
        }))
      : { width: viewport?.width || 0, height: viewport?.height || 0 };

    const mimeType = type === 'jpeg' ? 'image/jpeg' : type === 'webp' ? 'image/webp' : 'image/png';

    return {
      success: true,
      data: {
        data: screenshotData.toString('base64'),
        mimeType,
        width: dimensions.width,
        height: dimensions.height,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Screenshot failed', { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Click element
 */
export async function click(
  page: Page,
  options: ClickOptions
): Promise<PageOperationResult<void>> {
  const {
    selector,
    button = 'left',
    clickCount = 1,
    delay = 0,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  logger.debug(`Clicking element: ${selector}`, { button, clickCount, delay });

  try {
    await page.waitForSelector(selector, { timeout, visible: true });
    await page.click(selector, { button, clickCount, delay });

    logger.debug(`Click successful: ${selector}`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Click failed: ${selector}`, { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fill form field
 */
export async function fill(
  page: Page,
  options: FillOptions
): Promise<PageOperationResult<void>> {
  const {
    selector,
    value,
    delay = 0,
    timeout = DEFAULT_TIMEOUT,
    clearFirst = true,
  } = options;

  logger.debug(`Filling element: ${selector}`, { valueLength: value.length, clearFirst });

  try {
    await page.waitForSelector(selector, { timeout, visible: true });

    if (clearFirst) {
      await page.click(selector, { clickCount: 3 }); // Select all
    }

    await page.type(selector, value, { delay });

    logger.debug(`Fill successful: ${selector}`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Fill failed: ${selector}`, { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Extract data from page
 */
export async function extract(
  page: Page,
  options: ExtractOptions
): Promise<PageOperationResult<ExtractResult>> {
  const { selector, attribute, multiple = false } = options;

  logger.debug(`Extracting data: ${selector}`, { attribute, multiple });

  try {
    const extractElement = (el: Element): ExtractedElement => ({
      text: el.textContent?.trim() || '',
      html: el.innerHTML,
      attributes: Array.from(el.attributes).reduce(
        (acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        },
        {} as Record<string, string>
      ),
    });

    if (multiple) {
      const elements = await page.$$eval(selector, (els) =>
        els.map((el) => ({
          text: el.textContent?.trim() || '',
          html: el.innerHTML,
          attributes: Array.from(el.attributes).reduce(
            (acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            },
            {} as Record<string, string>
          ),
        }))
      );

      logger.debug(`Extracted ${elements.length} elements`);

      return {
        success: true,
        data: { elements },
      };
    } else {
      const element = await page.$(selector);
      if (!element) {
        return {
          success: false,
          error: `Element not found: ${selector}`,
        };
      }

      let result: ExtractResult;

      if (attribute) {
        const attrValue = await element.evaluate((el, attr) => el.getAttribute(attr), attribute);
        result = { attribute: attrValue || undefined };
      } else {
        const extracted = await element.evaluate(extractElement);
        result = {
          text: extracted.text,
          html: extracted.html,
        };
      }

      logger.debug(`Extraction successful: ${selector}`);

      return {
        success: true,
        data: result,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Extract failed: ${selector}`, { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Wait for selector
 */
export async function waitForSelector(
  page: Page,
  options: WaitForSelectorOptions
): Promise<PageOperationResult<void>> {
  const { selector, state = 'visible', timeout = DEFAULT_TIMEOUT } = options;

  logger.debug(`Waiting for selector: ${selector}`, { state, timeout });

  try {
    await page.waitForSelector(selector, { visible: state === 'visible', hidden: state === 'hidden', timeout });

    logger.debug(`Selector found: ${selector}`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Wait for selector failed: ${selector}`, { error: errorMessage });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get page content
 */
export async function getPageContent(page: Page): Promise<PageOperationResult<string>> {
  try {
    const content = await page.content();
    return { success: true, data: content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Get page content failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Get page URL
 */
export async function getPageUrl(page: Page): Promise<string> {
  return page.url();
}

/**
 * Get page title
 */
export async function getPageTitle(page: Page): Promise<string> {
  return page.title();
}

/**
 * Execute JavaScript in page context
 */
export async function evaluate(
  page: Page,
  script: string
): Promise<PageOperationResult<unknown>> {
  logger.debug('Executing script in page context');

  try {
    const result = await page.evaluate(script);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Script execution failed', { error: errorMessage });
    return { success: false, error: errorMessage };
  }
}
