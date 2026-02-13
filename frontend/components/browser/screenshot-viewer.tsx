'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import type { ScreenshotResult } from '@/types/browser';

interface ScreenshotViewerProps {
  screenshot: ScreenshotResult | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ScreenshotViewer({
  screenshot,
  isLoading = false,
  onRefresh,
}: ScreenshotViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    if (!screenshot) return;

    const link = document.createElement('a');
    link.href = `data:${screenshot.mimeType};base64,${screenshot.data}`;
    link.download = `screenshot-${Date.now()}.${screenshot.mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <RotateCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Taking screenshot...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!screenshot) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div className="text-4xl opacity-50">📸</div>
            <p className="text-sm text-muted-foreground">
              No screenshot available.
              <br />
              Navigate to a page and take a screenshot.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const imageSrc = `data:${screenshot.mimeType};base64,${screenshot.data}`;

  const content = (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Screenshot</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onRefresh} title="Refresh">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} title="Fullscreen">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} title="Download">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {screenshot.width} x {screenshot.height}
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div
          className="relative inline-block"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Browser Screenshot"
            className="border rounded shadow-sm max-w-none"
            style={{
              width: screenshot.width,
              height: screenshot.height,
            }}
          />
        </div>
      </CardContent>
    </>
  );

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsFullscreen(false);
        }}
      >
        <div className="flex justify-end p-2 border-b">
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
            Exit Fullscreen
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div
            className="relative inline-block mx-auto"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Browser Screenshot"
              className="border rounded shadow-sm"
              style={{
                maxWidth: 'none',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <Card className="h-full">{content}</Card>;
}
