'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send, Copy, CheckCircle2 } from 'lucide-react';
import type { Model, ModelTestRequest, ModelTestResponse } from '@/types/model';
import { cn } from '@/lib/utils';

interface ModelTestDialogProps {
  model: Model | null;
  open: boolean;
  onClose: () => void;
  onTest: (request: ModelTestRequest) => Promise<ModelTestResponse>;
  // Text props for i18n
  text?: {
    title?: string;
    description?: string;
    prompt?: string;
    maxTokens?: string;
    temperature?: string;
    test?: string;
    cancel?: string;
    testing?: string;
    response?: string;
    usage?: string;
    promptTokens?: string;
    completionTokens?: string;
    totalTokens?: string;
    latency?: string;
    copy?: string;
    copied?: string;
    error?: string;
  };
}

export function ModelTestDialog({
  model,
  open,
  onClose,
  onTest,
  text
}: ModelTestDialogProps) {
  const [prompt, setPrompt] = useState('Hello, how are you?');
  const [maxTokens, setMaxTokens] = useState(100);
  const [temperature, setTemperature] = useState(0.7);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<ModelTestResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!model || !prompt.trim()) return;

    setIsTesting(true);
    setResult(null);

    try {
      const response = await onTest({
        modelId: model.id,
        prompt: prompt.trim(),
        maxTokens,
        temperature,
      });
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = () => {
    if (result?.response) {
      navigator.clipboard.writeText(result.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPrompt('Hello, how are you?');
    setMaxTokens(100);
    setTemperature(0.7);
    setResult(null);
    onClose();
  };

  const t = text;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t?.title || 'Test Model'} {model && `- ${model.name}`}
          </DialogTitle>
          <DialogDescription>
            {t?.description || 'Send a test prompt to verify the model is working correctly.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt">{t?.prompt || 'Prompt'}</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your test prompt here..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxTokens">{t?.maxTokens || 'Max Tokens'}</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max="4096"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 100)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temperature">{t?.temperature || 'Temperature'}</Label>
                <Select
                  value={temperature.toString()}
                  onValueChange={(v) => setTemperature(parseFloat(v))}
                >
                  <SelectTrigger id="temperature">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.0">0.0 (Focused)</SelectItem>
                    <SelectItem value="0.3">0.3 (Balanced)</SelectItem>
                    <SelectItem value="0.7">0.7 (Creative)</SelectItem>
                    <SelectItem value="1.0">1.0 (Very Creative)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleTest}
              disabled={!prompt.trim() || isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t?.testing || 'Testing...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t?.test || 'Test'}
                </>
              )}
            </Button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>{t?.response || 'Response'}</Label>
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Success
                    </>
                  ) : (
                    t?.error || 'Error'
                  )}
                </Badge>
              </div>

              {result.error ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">{result.error}</p>
                </div>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {result.response}
                  </div>
                </ScrollArea>
              )}

              {/* Usage Stats */}
              {result.usage && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t?.promptTokens || 'Prompt Tokens'}</p>
                    <p className="text-lg font-semibold">{result.usage.promptTokens}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t?.completionTokens || 'Completion Tokens'}</p>
                    <p className="text-lg font-semibold">{result.usage.completionTokens}</p>
                  </div>
                  <div className="col-span-2 border-t pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{t?.totalTokens || 'Total Tokens'}</p>
                      <p className="text-lg font-semibold">{result.usage.totalTokens}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Latency */}
              {result.latency && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t?.latency || 'Latency'}</span>
                  <span className="font-mono font-medium">{result.latency}ms</span>
                </div>
              )}

              {/* Copy Button */}
              {result.response && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t?.copied || 'Copied!'}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t?.copy || 'Copy Response'}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {t?.cancel || 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
