'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Channel, CreateChannelRequest, ChannelType, ApiKeyVisibility } from '@/types/channel';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationError {
  field: string;
  message: string;
}

interface ChannelFormProps {
  channel?: Channel;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChannelRequest) => void;
  isLoading: boolean;
  // Text props for i18n
  text?: {
    title?: {
      edit: string;
      add: string;
    };
    description?: {
      edit: string;
      add: string;
    };
    fields?: {
      name: string;
      type: string;
      priority: string;
      enabled: string;
      apiKey: string;
      baseURL: string;
      timeout: string;
      maxRetries: string;
    };
    placeholders?: {
      name: string;
      apiKey: string;
      baseURL: string;
    };
    errors?: {
      required: string;
      invalidUrl: string;
      invalidApiKey: string;
      invalidPriority: string;
      nameTooShort: string;
    };
    buttons?: {
      cancel: string;
      update: string;
      add: string;
      saving: string;
      testConnection: string;
    };
    types?: {
      openai: string;
      anthropic: string;
      azure: string;
      custom: string;
    };
  };
}

// API Key patterns for validation
const API_KEY_PATTERNS: Record<ChannelType, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{32,}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9_-]{60,}$/,
  azure: /^[a-zA-Z0-9]{32,}$/,
  custom: /.+/, // Any non-empty string for custom
};

// Default Base URLs
const DEFAULT_BASE_URLS: Record<ChannelType, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  azure: '',
  custom: '',
};

export function ChannelForm({
  channel,
  open,
  onClose,
  onSubmit,
  isLoading,
  text
}: ChannelFormProps) {
  const [formData, setFormData] = useState<CreateChannelRequest>(
    channel || {
      name: '',
      type: 'openai' as ChannelType,
      enabled: true,
      priority: 1,
      config: {
        apiKey: '',
        baseURL: DEFAULT_BASE_URLS.openai,
        timeout: 30,
        maxRetries: 3,
      },
    }
  );

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [apiKeyVisibility, setApiKeyVisibility] = useState<ApiKeyVisibility>('masked');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isValidApiKey, setIsValidApiKey] = useState(false);

  // Reset form when channel changes or dialog opens
  useEffect(() => {
    if (open) {
      const initialData = channel || {
        name: '',
        type: 'openai' as ChannelType,
        enabled: true,
        priority: 1,
        config: {
          apiKey: '',
          baseURL: DEFAULT_BASE_URLS.openai,
          timeout: 30,
          maxRetries: 3,
        },
      };
      setFormData(initialData);
      setErrors([]);
      setTouched(new Set());
      setApiKeyVisibility('masked');
      setIsValidUrl(true);
      setIsValidApiKey(false);
    }
  }, [channel, open]);

  // Validate URL and API Key
  useEffect(() => {
    let validUrl = true;
    let validApiKey = false;

    if (formData.config.baseURL) {
      try {
        new URL(formData.config.baseURL);
        validUrl = true;
      } catch {
        validUrl = false;
      }
    }

    if (formData.config.apiKey) {
      const pattern = API_KEY_PATTERNS[formData.type];
      validApiKey = pattern.test(formData.config.apiKey);
    }

    setIsValidUrl(validUrl);
    setIsValidApiKey(validApiKey);
  }, [formData.config.baseURL, formData.config.apiKey, formData.type]);

  const validateField = (field: string, value: unknown): ValidationError | null => {
    const t = text?.errors;

    switch (field) {
      case 'name':
        if (!value || typeof value !== 'string' || value.trim().length < 2) {
          return { field, message: t?.nameTooShort || 'Name must be at least 2 characters' };
        }
        break;
      case 'apiKey':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return { field, message: t?.required || 'This field is required' };
        }
        break;
      case 'baseURL':
        if (value && typeof value === 'string' && value.trim().length > 0) {
          try {
            new URL(value);
          } catch {
            return { field, message: t?.invalidUrl || 'Invalid URL format' };
          }
        }
        break;
      case 'priority':
        if (typeof value !== 'number' || value < 1) {
          return { field, message: t?.invalidPriority || 'Priority must be at least 1' };
        }
        break;
    }
    return null;
  };

  const handleFieldBlur = (field: string, value: unknown) => {
    setTouched(prev => new Set([...prev, field]));
    const error = validateField(field, value);
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field);
      return error ? [...filtered, error] : filtered;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allErrors: ValidationError[] = [];
    const fieldsToValidate = [
      { field: 'name', value: formData.name },
      { field: 'apiKey', value: formData.config.apiKey },
      { field: 'baseURL', value: formData.config.baseURL },
      { field: 'priority', value: formData.priority },
    ];

    fieldsToValidate.forEach(({ field, value }) => {
      const error = validateField(field, value);
      if (error) allErrors.push(error);
    });

    setErrors(allErrors);
    setTouched(new Set(['name', 'apiKey', 'baseURL', 'priority']));

    if (allErrors.length === 0) {
      onSubmit(formData);
    }
  };

  const getErrorMessage = (field: string) => {
    return errors.find(e => e.field === field)?.message;
  };

  const getFieldError = (field: string) => {
    return touched.has(field) ? getErrorMessage(field) : undefined;
  };

  const getApiKeyDisplayValue = () => {
    const apiKey = formData.config.apiKey || '';
    switch (apiKeyVisibility) {
      case 'visible':
        return apiKey;
      case 'masked':
        return apiKey ? `${apiKey.slice(0, 8)}${'*'.repeat(Math.min(20, apiKey.length - 8))}` : '';
      case 'hidden':
        return '';
      default:
        return apiKey;
    }
  };

  const t = text?.fields;
  const p = text?.placeholders;
  const b = text?.buttons;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {channel ? (text?.title?.edit || 'Edit Channel') : (text?.title?.add || 'Add Channel')}
          </DialogTitle>
          <DialogDescription>
            {channel
              ? (text?.description?.edit || 'Update the channel configuration.')
              : (text?.description?.add || 'Add a new AI provider channel.')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name" className={cn(getFieldError('name') && 'text-destructive')}>
                {t?.name || 'Name'} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onBlur={() => handleFieldBlur('name', formData.name)}
                  placeholder={p?.name || 'OpenAI'}
                  className={cn(getFieldError('name') && 'border-destructive pr-9')}
                />
                {getFieldError('name') && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {getFieldError('name') && (
                <p className="text-xs text-destructive">{getFieldError('name')}</p>
              )}
            </div>

            {/* Type Field */}
            <div className="grid gap-2">
              <Label htmlFor="type">{t?.type || 'Type'}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  const newType = value as ChannelType;
                  setFormData({
                    ...formData,
                    type: newType,
                    config: {
                      ...formData.config,
                      baseURL: formData.config.baseURL || DEFAULT_BASE_URLS[newType],
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={text?.types?.custom || 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">{text?.types?.openai || 'OpenAI'}</SelectItem>
                  <SelectItem value="anthropic">{text?.types?.anthropic || 'Anthropic'}</SelectItem>
                  <SelectItem value="azure">{text?.types?.azure || 'Azure'}</SelectItem>
                  <SelectItem value="custom">{text?.types?.custom || 'Custom'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Field */}
            <div className="grid gap-2">
              <Label htmlFor="priority" className={cn(getFieldError('priority') && 'text-destructive')}>
                {t?.priority || 'Priority'} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                  }
                  onBlur={() => handleFieldBlur('priority', formData.priority)}
                  className={cn(getFieldError('priority') && 'border-destructive pr-9')}
                />
                {getFieldError('priority') && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {getFieldError('priority') && (
                <p className="text-xs text-destructive">{getFieldError('priority')}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Lower numbers have higher priority (1 is highest)
              </p>
            </div>

            {/* Enabled Switch */}
            <div className="flex items-center gap-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked })
                }
              />
              <Label htmlFor="enabled">{t?.enabled || 'Enabled'}</Label>
            </div>

            {/* API Key Field with Visibility Toggle */}
            <div className="grid gap-2">
              <Label htmlFor="apiKey" className={cn(getFieldError('apiKey') && 'text-destructive')}>
                {t?.apiKey || 'API Key'} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={apiKeyVisibility === 'visible' ? 'text' : 'password'}
                  value={getApiKeyDisplayValue()}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData({
                      ...formData,
                      config: { ...formData.config, apiKey: newValue },
                    });
                  }}
                  onBlur={() => handleFieldBlur('apiKey', formData.config.apiKey)}
                  placeholder={p?.apiKey || 'sk-...'}
                  className={cn(
                    getFieldError('apiKey') && 'border-destructive pr-16',
                    isValidApiKey && formData.config.apiKey && 'pr-16'
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {formData.config.apiKey && isValidApiKey && !getFieldError('apiKey') && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      if (apiKeyVisibility === 'visible') {
                        setApiKeyVisibility('masked');
                      } else {
                        setApiKeyVisibility('visible');
                      }
                    }}
                  >
                    {apiKeyVisibility === 'visible' ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {getFieldError('apiKey') ? (
                <p className="text-xs text-destructive">{getFieldError('apiKey')}</p>
              ) : formData.config.apiKey && !isValidApiKey ? (
                <p className="text-xs text-muted-foreground">
                  API key format may be incorrect for {formData.type}
                </p>
              ) : null}
            </div>

            {/* Base URL Field */}
            <div className="grid gap-2">
              <Label htmlFor="baseURL" className={cn(getFieldError('baseURL') && 'text-destructive')}>
                {t?.baseURL || 'Base URL'}
              </Label>
              <div className="relative">
                <Input
                  id="baseURL"
                  type="url"
                  value={formData.config.baseURL || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, baseURL: e.target.value },
                    })
                  }
                  onBlur={() => handleFieldBlur('baseURL', formData.config.baseURL)}
                  placeholder={p?.baseURL || 'https://api.openai.com/v1'}
                  className={cn(!isValidUrl && touched.has('baseURL') && 'border-destructive pr-9')}
                />
                {!isValidUrl && touched.has('baseURL') && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {getFieldError('baseURL') && (
                <p className="text-xs text-destructive">{getFieldError('baseURL')}</p>
              )}
            </div>

            {/* Advanced Settings */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground list-none flex items-center gap-2">
                <span>Advanced settings</span>
                <span className="transition group-open:rotate-90">▶</span>
              </summary>
              <div className="grid gap-4 mt-4 pl-4 border-l-2 border-muted">
                {/* Timeout */}
                <div className="grid gap-2">
                  <Label htmlFor="timeout">{t?.timeout || 'Timeout (seconds)'}</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="5"
                    max="300"
                    value={formData.config.timeout || 30}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, timeout: parseInt(e.target.value) || 30 },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Request timeout in seconds (5-300)</p>
                </div>

                {/* Max Retries */}
                <div className="grid gap-2">
                  <Label htmlFor="maxRetries">{t?.maxRetries || 'Max Retries'}</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.config.maxRetries || 3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, maxRetries: parseInt(e.target.value) || 0 },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Number of retry attempts (0-10)</p>
                </div>
              </div>
            </details>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {b?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading || errors.length > 0}>
              {isLoading ? (b?.saving || 'Saving...') : channel ? (b?.update || 'Update') : (b?.add || 'Add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
