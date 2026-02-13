// Browser Types

export type BrowserSessionStatus = 'active' | 'idle' | 'error' | 'closed';

export interface BrowserSession {
  id: string;
  status: BrowserSessionStatus;
  createdAt: string;
  lastActivity: string;
  currentPage?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface BrowserSessionInfo {
  id: string;
  status: BrowserSessionStatus;
  createdAt: string;
  lastActivity: string;
  currentPage?: string;
  pageCount: number;
}

export interface CreateSessionOptions {
  headless?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number;
}

export interface NavigateOptions {
  url: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}

export interface ClickOptions {
  selector: string;
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  timeout?: number;
}

export interface FillOptions {
  selector: string;
  value: string;
  delay?: number;
  timeout?: number;
  clearFirst?: boolean;
}

export interface ExtractOptions {
  selector: string;
  attribute?: string;
  multiple?: boolean;
}

export interface ExtractResult {
  text?: string;
  html?: string;
  attribute?: string;
  elements?: ExtractedElement[];
}

export interface ExtractedElement {
  text: string;
  html: string;
  attributes: Record<string, string>;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  selector?: string;
  type?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export interface ScreenshotResult {
  data: string; // Base64 encoded image
  mimeType: string;
  width: number;
  height: number;
}

export interface WaitForSelectorOptions {
  selector: string;
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
  timeout?: number;
}

export interface PageOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// WebSocket event types
export interface BrowserStatusEvent {
  sessionId: string;
  status: BrowserSessionStatus;
  currentPage?: string;
}

export interface BrowserScreenshotEvent {
  sessionId: string;
  screenshot: ScreenshotResult;
}

// Configuration
export interface BrowserConfig {
  maxSessions: number;
  defaultTimeout: number;
  defaultViewport: {
    width: number;
    height: number;
  };
  headless: boolean;
  urlWhitelist?: string[];
  urlBlacklist?: string[];
}
