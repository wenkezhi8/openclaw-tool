'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Info } from 'lucide-react';
import type { Model, ModelConfig, UpdateModelRequest } from '@/types/model';
import { cn } from '@/lib/utils';

interface ModelConfigDialogProps {
  model: Model | null;
  open: boolean;
  onClose: () => void;
  onSave: (modelId: string, config: UpdateModelRequest) => void;
  isLoading: boolean;
  // Text props for i18n
  text?: {
    title?: string;
    description?: string;
    settings?: string;
    maxTokens?: string;
    temperature?: string;
    topP?: string;
    rateLimit?: string;
    retryCount?: string;
    timeout?: string;
    enabled?: string;
    cancel?: string;
    save?: string;
    saving?: string;
    descriptions?: {
      maxTokens: string;
      temperature: string;
      topP: string;
      rateLimit: string;
      retryCount: string;
      timeout: string;
    };
  };
}

export function ModelConfigDialog({
  model,
  open,
  onClose,
  onSave,
  isLoading,
  text
}: ModelConfigDialogProps) {
  const [config, setConfig] = useState<ModelConfig>({});
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (model) {
      setConfig(model.config || {});
      setEnabled(model.enabled);
    } else {
      setConfig({});
      setEnabled(true);
    }
  }, [model, open]);

  const handleSave = () => {
    if (!model) return;

    onSave(model.id, {
      enabled,
      config,
    });
  };

  const updateConfig = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const t = text;
  const d = t?.descriptions;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>{t?.title || 'Model Configuration'}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            {model && (
              <span>
                Configure settings for <strong>{model.name}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="enabled">{t?.enabled || 'Enabled'}</Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable this model for requests
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Model Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t?.settings || 'Generation Settings'}
            </h3>

            {/* Max Tokens */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="maxTokens">{t?.maxTokens || 'Max Tokens'}</Label>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Input
                id="maxTokens"
                type="number"
                min="1"
                max="128000"
                step="1"
                value={config.maxTokens || ''}
                onChange={(e) =>
                  updateConfig('maxTokens', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="Default"
              />
              <p className="text-xs text-muted-foreground">
                {d?.maxTokens || 'Maximum number of tokens to generate. Leave empty for model default.'}
              </p>
            </div>

            {/* Temperature */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="temperature">{t?.temperature || 'Temperature'}</Label>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature ?? ''}
                  onChange={(e) =>
                    updateConfig('temperature', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Default"
                  className="flex-1"
                />
                <Select
                  value={config.temperature?.toString() || 'default'}
                  onValueChange={(v) =>
                    updateConfig('temperature', v === 'default' ? undefined : parseFloat(v))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="0.0">0.0</SelectItem>
                    <SelectItem value="0.3">0.3</SelectItem>
                    <SelectItem value="0.7">0.7</SelectItem>
                    <SelectItem value="1.0">1.0</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {d?.temperature || 'Controls randomness. Lower values are more focused, higher values more creative.'}
              </p>
            </div>

            {/* Top P */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="topP">{t?.topP || 'Top P'}</Label>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Input
                id="topP"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={config.topP ?? ''}
                onChange={(e) =>
                  updateConfig('topP', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="Default"
              />
              <p className="text-xs text-muted-foreground">
                {d?.topP || 'Nucleus sampling threshold. Leave empty for model default.'}
              </p>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Advanced Settings
            </h3>

            {/* Rate Limit */}
            <div className="grid gap-2">
              <Label htmlFor="rateLimit">{t?.rateLimit || 'Rate Limit (requests/minute)'}</Label>
              <Input
                id="rateLimit"
                type="number"
                min="1"
                max="1000"
                value={config.rateLimit || ''}
                onChange={(e) =>
                  updateConfig('rateLimit', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="Unlimited"
              />
              <p className="text-xs text-muted-foreground">
                {d?.rateLimit || 'Maximum requests per minute. Leave empty for unlimited.'}
              </p>
            </div>

            {/* Retry Count */}
            <div className="grid gap-2">
              <Label htmlFor="retryCount">{t?.retryCount || 'Retry Count'}</Label>
              <Input
                id="retryCount"
                type="number"
                min="0"
                max="10"
                value={config.retryCount || ''}
                onChange={(e) =>
                  updateConfig('retryCount', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">
                {d?.retryCount || 'Number of retry attempts for failed requests.'}
              </p>
            </div>

            {/* Timeout */}
            <div className="grid gap-2">
              <Label htmlFor="timeout">{t?.timeout || 'Timeout (seconds)'}</Label>
              <Input
                id="timeout"
                type="number"
                min="5"
                max="300"
                value={config.timeout || ''}
                onChange={(e) =>
                  updateConfig('timeout', e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground">
                {d?.timeout || 'Request timeout in seconds.'}
              </p>
            </div>
          </div>

          {/* Current Config Preview */}
          {model?.config && Object.keys(model.config).length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium mb-2">Current Configuration</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(model.config).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t?.cancel || 'Cancel'}
          </Button>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (t?.saving || 'Saving...') : (t?.save || 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
