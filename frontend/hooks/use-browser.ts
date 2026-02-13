'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  BrowserSessionInfo,
  CreateSessionOptions,
  NavigateOptions,
  NavigateResult,
  ClickOptions,
  FillOptions,
  ExtractOptions,
  ExtractResult,
  ScreenshotOptions,
  ScreenshotResult,
  WaitForSelectorOptions,
} from '@/types/browser';

const BROWSER_QUERY_KEY = ['browser'] as const;

// Session queries
export function useBrowserSessions() {
  return useQuery<BrowserSessionInfo[]>({
    queryKey: [...BROWSER_QUERY_KEY, 'sessions'],
    queryFn: async () => {
      const response = await apiClient.get<BrowserSessionInfo[]>(API_ENDPOINTS.BROWSER_SESSIONS);
      return response.data!;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useBrowserSession(id: string | undefined) {
  return useQuery<BrowserSessionInfo>({
    queryKey: [...BROWSER_QUERY_KEY, 'session', id],
    queryFn: async () => {
      if (!id) throw new Error('Session ID is required');
      const response = await apiClient.get<BrowserSessionInfo>(
        API_ENDPOINTS.BROWSER_SESSION_DETAIL(id)
      );
      return response.data!;
    },
    enabled: !!id,
    refetchInterval: 3000,
  });
}

// Session actions
export function useBrowserSessionActions() {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async (options?: CreateSessionOptions) => {
      const response = await apiClient.post<BrowserSessionInfo>(
        API_ENDPOINTS.BROWSER_SESSIONS,
        options
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BROWSER_QUERY_KEY, 'sessions'] });
    },
  });

  const closeSession = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.BROWSER_SESSION_DETAIL(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BROWSER_QUERY_KEY, 'sessions'] });
    },
  });

  return {
    createSession: (options?: CreateSessionOptions) => createSession.mutate(options),
    closeSession: (id: string) => closeSession.mutate(id),
    isCreating: createSession.isPending,
    isClosing: closeSession.isPending,
  };
}

// Page operations
export function useBrowserOperations(sessionId: string | undefined) {
  const queryClient = useQueryClient();

  // Navigate
  const navigate = useMutation({
    mutationFn: async (options: NavigateOptions) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<NavigateResult>(
        API_ENDPOINTS.BROWSER_SESSION_NAVIGATE(sessionId!),
        options
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BROWSER_QUERY_KEY, 'session', sessionId] });
    },
  });

  // Screenshot
  const takeScreenshot = useMutation({
    mutationFn: async (options?: ScreenshotOptions) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<ScreenshotResult>(
        API_ENDPOINTS.BROWSER_SESSION_SCREENSHOT(sessionId!),
        options || {}
      );
      return response;
    },
  });

  // Click
  const click = useMutation({
    mutationFn: async (options: ClickOptions) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<void>(
        API_ENDPOINTS.BROWSER_SESSION_CLICK(sessionId!),
        options
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BROWSER_QUERY_KEY, 'session', sessionId] });
    },
  });

  // Fill
  const fill = useMutation({
    mutationFn: async (options: FillOptions) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<void>(
        API_ENDPOINTS.BROWSER_SESSION_FILL(sessionId!),
        options
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BROWSER_QUERY_KEY, 'session', sessionId] });
    },
  });

  // Extract
  const extract = useMutation({
    mutationFn: async (options: ExtractOptions) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<ExtractResult>(
        API_ENDPOINTS.BROWSER_SESSION_EXTRACT(sessionId!),
        options
      );
      return response;
    },
  });

  // Wait for selector
  const waitForSelector = useMutation({
    mutationFn: async (options: WaitForSelectorOptions) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<void>(
        API_ENDPOINTS.BROWSER_SESSION_WAIT(sessionId!),
        options
      );
      return response;
    },
  });

  // Get page content
  const getPageContent = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.get<string>(
        API_ENDPOINTS.BROWSER_SESSION_CONTENT(sessionId!)
      );
      return response;
    },
  });

  // Execute JavaScript
  const evaluate = useMutation({
    mutationFn: async (script: string) => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<unknown>(
        API_ENDPOINTS.BROWSER_SESSION_EVALUATE(sessionId!),
        { script }
      );
      return response;
    },
  });

  // Create new page
  const createPage = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.post<{ pageId: string }>(
        API_ENDPOINTS.BROWSER_SESSION_PAGES(sessionId!)
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BROWSER_QUERY_KEY, 'session', sessionId] });
    },
  });

  return {
    // Navigation
    navigate: (options: NavigateOptions) => navigate.mutate(options),
    navigateAsync: navigate.mutateAsync,
    isNavigating: navigate.isPending,

    // Screenshot
    takeScreenshot: (options?: ScreenshotOptions) => takeScreenshot.mutate(options),
    takeScreenshotAsync: takeScreenshot.mutateAsync,
    isTakingScreenshot: takeScreenshot.isPending,
    screenshotData: takeScreenshot.data?.data,

    // Click
    click: (options: ClickOptions) => click.mutate(options),
    clickAsync: click.mutateAsync,
    isClicking: click.isPending,

    // Fill
    fill: (options: FillOptions) => fill.mutate(options),
    fillAsync: fill.mutateAsync,
    isFilling: fill.isPending,

    // Extract
    extract: (options: ExtractOptions) => extract.mutate(options),
    extractAsync: extract.mutateAsync,
    isExtracting: extract.isPending,
    extractData: extract.data?.data,

    // Wait
    waitForSelector: (options: WaitForSelectorOptions) => waitForSelector.mutate(options),
    waitForSelectorAsync: waitForSelector.mutateAsync,
    isWaiting: waitForSelector.isPending,

    // Content
    getPageContent: () => getPageContent.mutate(),
    getPageContentAsync: getPageContent.mutateAsync,
    isGettingContent: getPageContent.isPending,
    pageContent: getPageContent.data?.data,

    // Evaluate
    evaluate: (script: string) => evaluate.mutate(script),
    evaluateAsync: evaluate.mutateAsync,
    isEvaluating: evaluate.isPending,
    evaluateResult: evaluate.data?.data,

    // Page management
    createPage: () => createPage.mutate(),
    createPageAsync: createPage.mutateAsync,
    isCreatingPage: createPage.isPending,

    // General
    isLoading:
      navigate.isPending ||
      takeScreenshot.isPending ||
      click.isPending ||
      fill.isPending ||
      extract.isPending ||
      waitForSelector.isPending ||
      getPageContent.isPending ||
      evaluate.isPending ||
      createPage.isPending,
  };
}
