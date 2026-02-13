'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useBrowserSessions,
  useBrowserSession,
  useBrowserSessionActions,
  useBrowserOperations,
} from '@/hooks';
import {
  BrowserSessionCard,
  BrowserControls,
  ScreenshotViewer,
  ExtractedDataPanel,
} from '@/components/browser';
import { ErrorMessage } from '@/components/common';
import { Plus, RefreshCw, Loader2, Monitor } from 'lucide-react';
import type { ScreenshotResult, ExtractResult } from '@/types/browser';

export default function BrowserPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<ScreenshotResult | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractResult | null>(null);

  // Queries
  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useBrowserSessions();

  const { data: activeSession } = useBrowserSession(activeSessionId || undefined);

  // Mutations
  const { createSession, closeSession, isCreating, isClosing } = useBrowserSessionActions();

  const operations = useBrowserOperations(activeSessionId || undefined);

  // Auto-select first session if none selected
  useEffect(() => {
    if (sessions && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Clear session-dependent data when session changes
  useEffect(() => {
    setScreenshot(null);
    setExtractedData(null);
  }, [activeSessionId]);

  // Handlers
  const handleCreateSession = useCallback(() => {
    createSession({ headless: true });
  }, [createSession]);

  const handleCloseSession = useCallback(
    (id: string) => {
      closeSession(id);
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    },
    [closeSession, activeSessionId]
  );

  const handleNavigate = useCallback(
    (options: { url: string; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) => {
      operations.navigateAsync(options).then(() => {
        // Take screenshot after navigation
        operations.takeScreenshotAsync({}).then((response) => {
          if (response.data) {
            setScreenshot(response.data);
          }
        });
      });
    },
    [operations]
  );

  const handleClick = useCallback(
    (options: { selector: string }) => {
      operations.clickAsync(options).then(() => {
        // Take screenshot after click
        operations.takeScreenshotAsync({}).then((response) => {
          if (response.data) {
            setScreenshot(response.data);
          }
        });
      });
    },
    [operations]
  );

  const handleFill = useCallback(
    (options: { selector: string; value: string }) => {
      operations.fillAsync(options);
    },
    [operations]
  );

  const handleExtract = useCallback(
    (options: { selector: string; attribute?: string; multiple?: boolean }) => {
      operations.extractAsync(options).then((response) => {
        if (response.data) {
          setExtractedData(response.data);
        }
      });
    },
    [operations]
  );

  const handleScreenshot = useCallback(
    (options?: { fullPage?: boolean }) => {
      operations.takeScreenshotAsync(options).then((response) => {
        if (response.data) {
          setScreenshot(response.data);
        }
      });
    },
    [operations]
  );

  const isLoading = operations.isLoading || isCreating || isClosing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Monitor className="h-8 w-8" />
            Browser Control
          </h1>
          <p className="text-muted-foreground">
            Control headless browsers for web automation and scraping
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchSessions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateSession} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            New Session
          </Button>
        </div>
      </div>

      {/* Error */}
      {sessionsError && (
        <ErrorMessage
          message={sessionsError instanceof Error ? sessionsError.message : 'Failed to load browser sessions'}
          onRetry={() => refetchSessions()}
        />
      )}

      {/* Sessions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
        {sessionsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading sessions...
            </CardContent>
          </Card>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sessions.map((session) => (
              <BrowserSessionCard
                key={session.id}
                session={session}
                isActive={activeSessionId === session.id}
                onSelect={() => setActiveSessionId(session.id)}
                onClose={() => handleCloseSession(session.id)}
                isLoading={isClosing}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No active browser sessions.
                <br />
                Click &quot;New Session&quot; to create one.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Session Controls */}
      {activeSessionId && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID</span>
                    <span className="font-mono">{activeSessionId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>{activeSession?.status || 'unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Page</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">
                      {activeSession?.currentPage || 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browser Controls */}
            <BrowserControls
              currentPage={activeSession?.currentPage}
              isLoading={isLoading}
              onNavigate={handleNavigate}
              onClick={handleClick}
              onFill={handleFill}
              onExtract={handleExtract}
              onScreenshot={handleScreenshot}
            />

            {/* Extracted Data */}
            <ExtractedDataPanel
              data={extractedData}
              isLoading={operations.isExtracting}
            />
          </div>

          {/* Right Column - Screenshot */}
          <ScreenshotViewer
            screenshot={screenshot}
            isLoading={operations.isTakingScreenshot}
            onRefresh={() => handleScreenshot()}
          />
        </div>
      )}
    </div>
  );
}
