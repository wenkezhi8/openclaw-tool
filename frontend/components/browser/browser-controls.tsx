'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  MousePointer,
  Type,
  Database,
  Camera,
  Loader2,
  Globe,
  Code,
} from 'lucide-react';
import type { NavigateOptions, ClickOptions, FillOptions, ExtractOptions, ScreenshotOptions } from '@/types/browser';

interface BrowserControlsProps {
  currentPage?: string;
  isLoading?: boolean;
  onNavigate: (options: NavigateOptions) => void;
  onClick: (options: ClickOptions) => void;
  onFill: (options: FillOptions) => void;
  onExtract: (options: ExtractOptions) => void;
  onScreenshot: (options?: ScreenshotOptions) => void;
}

export function BrowserControls({
  currentPage,
  isLoading = false,
  onNavigate,
  onClick,
  onFill,
  onExtract,
  onScreenshot,
}: BrowserControlsProps) {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [value, setValue] = useState('');
  const [extractAttribute, setExtractAttribute] = useState('');
  const [extractMultiple, setExtractMultiple] = useState(false);
  const [screenshotFullPage, setScreenshotFullPage] = useState(false);
  const [waitState, setWaitState] = useState<'load' | 'domcontentloaded' | 'networkidle'>('load');

  const handleNavigate = useCallback(() => {
    if (!url) return;
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    onNavigate({ url: finalUrl, waitUntil: waitState });
  }, [url, waitState, onNavigate]);

  const handleClick = useCallback(() => {
    if (!selector) return;
    onClick({ selector });
  }, [selector, onClick]);

  const handleFill = useCallback(() => {
    if (!selector) return;
    onFill({ selector, value, clearFirst: true });
  }, [selector, value, onFill]);

  const handleExtract = useCallback(() => {
    if (!selector) return;
    onExtract({ selector, attribute: extractAttribute || undefined, multiple: extractMultiple });
  }, [selector, extractAttribute, extractMultiple, onExtract]);

  const handleScreenshot = useCallback(() => {
    onScreenshot({ fullPage: screenshotFullPage });
  }, [screenshotFullPage, onScreenshot]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="h-5 w-5" />
          Browser Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="navigate" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="navigate" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Navigate
            </TabsTrigger>
            <TabsTrigger value="click" className="text-xs">
              <MousePointer className="h-3 w-3 mr-1" />
              Click
            </TabsTrigger>
            <TabsTrigger value="fill" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Fill
            </TabsTrigger>
            <TabsTrigger value="extract" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Extract
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="text-xs">
              <Camera className="h-3 w-3 mr-1" />
              Screen
            </TabsTrigger>
          </TabsList>

          {/* Navigate Tab */}
          <TabsContent value="navigate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                />
                <Select value={waitState} onValueChange={(v: typeof waitState) => setWaitState(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="load">Load</SelectItem>
                    <SelectItem value="domcontentloaded">DOM Ready</SelectItem>
                    <SelectItem value="networkidle">Network Idle</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleNavigate} disabled={isLoading || !url}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {currentPage && (
              <div className="text-sm text-muted-foreground">
                Current: <span className="font-mono">{currentPage}</span>
              </div>
            )}
          </TabsContent>

          {/* Click Tab */}
          <TabsContent value="click" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="click-selector">CSS Selector</Label>
              <div className="flex gap-2">
                <Input
                  id="click-selector"
                  placeholder="button.submit, #login-btn"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleClick} disabled={isLoading || !selector}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MousePointer className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Fill Tab */}
          <TabsContent value="fill" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fill-selector">CSS Selector</Label>
              <Input
                id="fill-selector"
                placeholder="input[name='username'], #email"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fill-value">Value</Label>
              <div className="flex gap-2">
                <Input
                  id="fill-value"
                  placeholder="Enter text..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleFill} disabled={isLoading || !selector}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Type className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Extract Tab */}
          <TabsContent value="extract" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="extract-selector">CSS Selector</Label>
              <Input
                id="extract-selector"
                placeholder="h1.title, .product-name"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extract-attribute">Attribute (optional)</Label>
              <Input
                id="extract-attribute"
                placeholder="href, src, data-id"
                value={extractAttribute}
                onChange={(e) => setExtractAttribute(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="extract-multiple" className="cursor-pointer">
                Extract multiple elements
              </Label>
              <input
                id="extract-multiple"
                type="checkbox"
                checked={extractMultiple}
                onChange={(e) => setExtractMultiple(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <Button
              onClick={handleExtract}
              disabled={isLoading || !selector}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Extract Data
            </Button>
          </TabsContent>

          {/* Screenshot Tab */}
          <TabsContent value="screenshot" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="fullpage" className="cursor-pointer">
                Capture full page
              </Label>
              <input
                id="fullpage"
                type="checkbox"
                checked={screenshotFullPage}
                onChange={(e) => setScreenshotFullPage(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            <Button
              onClick={handleScreenshot}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              Take Screenshot
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
