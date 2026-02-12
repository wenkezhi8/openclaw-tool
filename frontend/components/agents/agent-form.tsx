'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent, CreateAgentRequest, AgentType, AgentConfig } from '@/types/agent';

interface FormErrors {
  name?: string;
  model?: string;
  temperature?: string;
  maxTokens?: string;
  general?: string;
}

interface AgentFormProps {
  agent?: Agent;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAgentRequest) => void;
  isLoading: boolean;
  initialConfig?: AgentConfig;
  // i18n text props (future translation support)
  texts?: {
    title?: string;
    titleEdit?: string;
    description?: string;
    descriptionEdit?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    nameRequired?: string;
    nameMinLength?: string;
    nameMaxLength?: string;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
    typeLabel?: string;
    typePlaceholder?: string;
    modelLabel?: string;
    modelPlaceholder?: string;
    modelRequired?: string;
    temperatureLabel?: string;
    temperatureMin?: string;
    temperatureMax?: string;
    maxTokensLabel?: string;
    maxTokensMin?: string;
    maxTokensMax?: string;
    systemPromptLabel?: string;
    systemPromptPlaceholder?: string;
    cancel?: string;
    create?: string;
    update?: string;
    saving?: string;
    typeChat?: string;
    typeCompletion?: string;
    typeEmbedding?: string;
    typeCustom?: string;
  };
}

// Common model presets for suggestions
const MODEL_PRESETS: Record<AgentType, string[]> = {
  chat: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
  completion: ['gpt-3.5-turbo-instruct', 'text-davinci-003'],
  embedding: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
  custom: ['custom-model'],
};

const DEFAULT_CONFIG: AgentConfig = {
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: '',
};

export function AgentForm({
  agent,
  open,
  onClose,
  onSubmit,
  isLoading,
  initialConfig,
  texts = {},
}: AgentFormProps) {
  const {
    title = 'Create Agent',
    titleEdit = 'Edit Agent',
    description = 'Create a new AI agent with custom configuration.',
    descriptionEdit = 'Update the agent configuration.',
    nameLabel = 'Name',
    namePlaceholder = 'My Agent',
    nameRequired = 'Name is required',
    nameMinLength = 'Name must be at least 2 characters',
    nameMaxLength = 'Name must be less than 100 characters',
    descriptionLabel = 'Description',
    descriptionPlaceholder = 'Describe what this agent does...',
    typeLabel = 'Type',
    typePlaceholder = 'Select type',
    modelLabel = 'Model',
    modelPlaceholder = 'gpt-4',
    modelRequired = 'Model is required',
    temperatureLabel = 'Temperature',
    temperatureMin = 'Temperature must be between 0 and 2',
    temperatureMax = 'Temperature must be between 0 and 2',
    maxTokensLabel = 'Max Tokens',
    maxTokensMin = 'Max tokens must be at least 1',
    maxTokensMax = 'Max tokens cannot exceed 32000',
    systemPromptLabel = 'System Prompt',
    systemPromptPlaceholder = 'You are a helpful assistant...',
    cancel = 'Cancel',
    create = 'Create',
    update = 'Update',
    saving = 'Saving...',
    typeChat = 'Chat',
    typeCompletion = 'Completion',
    typeEmbedding = 'Embedding',
    typeCustom = 'Custom',
  } = texts;

  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: agent?.name || '',
    description: agent?.description || '',
    type: agent?.type || ('chat' as AgentType),
    model: agent?.model || MODEL_PRESETS.chat[0],
    config: initialConfig || { ...DEFAULT_CONFIG },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Reset form when opening/closing or agent changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: agent?.name || '',
        description: agent?.description || '',
        type: agent?.type || ('chat' as AgentType),
        model: agent?.model || MODEL_PRESETS.chat[0],
        config: initialConfig || { ...DEFAULT_CONFIG },
      });
      setErrors({});
      setTouched(new Set());
    }
  }, [open, agent, initialConfig]);

  // Update model when type changes (preset suggestion)
  useEffect(() => {
    if (!agent && formData.type) {
      const presets = MODEL_PRESETS[formData.type];
      if (presets && presets.length > 0) {
        setFormData((prev) => ({
          ...prev,
          model: prev.model || presets[0],
        }));
      }
    }
  }, [formData.type, agent]);

  const validateField = useCallback((name: string, value: unknown): string | undefined => {
    switch (name) {
      case 'name':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return nameRequired;
        }
        if (typeof value === 'string') {
          if (value.length < 2) return nameMinLength;
          if (value.length > 100) return nameMaxLength;
        }
        break;
      case 'model':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return modelRequired;
        }
        break;
      case 'temperature':
        const temp = typeof value === 'number' ? value : parseFloat(value as string);
        if (isNaN(temp) || temp < 0 || temp > 2) {
          return temperatureMin;
        }
        break;
      case 'maxTokens':
        const tokens = typeof value === 'number' ? value : parseInt(value as string);
        if (isNaN(tokens) || tokens < 1) {
          return maxTokensMin;
        }
        if (tokens > 32000) {
          return maxTokensMax;
        }
        break;
    }
    return undefined;
  }, [nameRequired, nameMinLength, nameMaxLength, modelRequired, temperatureMin, maxTokensMin, maxTokensMax]);

  const handleFieldChange = <T extends string | number>(
    field: string,
    value: T,
    isNested?: boolean
  ) => {
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof FormErrors];
      return newErrors;
    });

    if (isNested) {
      setFormData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Validate on change if field was touched
    if (touched.has(field)) {
      const error = validateField(field, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => new Set([...prev, field]));

    const value = field in formData.config
      ? formData.config[field as keyof AgentConfig]
      : formData[field as keyof CreateAgentRequest];

    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};

    // Validate name
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;

    // Validate model
    const modelError = validateField('model', formData.model);
    if (modelError) newErrors.model = modelError;

    // Validate temperature
    const tempError = validateField('temperature', formData.config.temperature);
    if (tempError) newErrors.temperature = tempError;

    // Validate maxTokens
    const tokensError = validateField('maxTokens', formData.config.maxTokens);
    if (tokensError) newErrors.maxTokens = tokensError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const modelPresets = MODEL_PRESETS[formData.type] || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent ? titleEdit : title}</DialogTitle>
          <DialogDescription>
            {agent ? descriptionEdit : description}
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
              {nameLabel}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              placeholder={namePlaceholder}
              className={cn(errors.name && 'border-destructive')}
              required
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">{descriptionLabel}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder={descriptionPlaceholder}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type Field */}
            <div className="space-y-2">
              <Label htmlFor="type">{typeLabel}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleFieldChange('type', value as AgentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={typePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">{typeChat}</SelectItem>
                  <SelectItem value="completion">{typeCompletion}</SelectItem>
                  <SelectItem value="embedding">{typeEmbedding}</SelectItem>
                  <SelectItem value="custom">{typeCustom}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Field */}
            <div className="space-y-2">
              <Label htmlFor="model" className={errors.model ? 'text-destructive' : ''}>
                {modelLabel}
              </Label>
              <Select
                value={formData.model}
                onValueChange={(value) => handleFieldChange('model', value)}
              >
                <SelectTrigger
                  className={cn(errors.model && 'border-destructive')}
                >
                  <SelectValue placeholder={modelPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {modelPresets.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="text-xs text-destructive">{errors.model}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Temperature Field */}
            <div className="space-y-2">
              <Label htmlFor="temperature" className={errors.temperature ? 'text-destructive' : ''}>
                {temperatureLabel}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.config.temperature ?? DEFAULT_CONFIG.temperature}
                  onChange={(e) =>
                    handleFieldChange('temperature', parseFloat(e.target.value) || 0, true)
                  }
                  onBlur={() => handleFieldBlur('temperature')}
                  className={cn(errors.temperature && 'border-destructive')}
                />
                <span className="text-xs text-muted-foreground w-16">
                  (0 - 2)
                </span>
              </div>
              {errors.temperature && (
                <p className="text-xs text-destructive">{errors.temperature}</p>
              )}
            </div>

            {/* Max Tokens Field */}
            <div className="space-y-2">
              <Label htmlFor="maxTokens" className={errors.maxTokens ? 'text-destructive' : ''}>
                {maxTokensLabel}
              </Label>
              <Input
                id="maxTokens"
                type="number"
                min="1"
                max="32000"
                value={formData.config.maxTokens ?? DEFAULT_CONFIG.maxTokens}
                onChange={(e) =>
                  handleFieldChange('maxTokens', parseInt(e.target.value) || 1, true)
                }
                onBlur={() => handleFieldBlur('maxTokens')}
                className={cn(errors.maxTokens && 'border-destructive')}
              />
              {errors.maxTokens && (
                <p className="text-xs text-destructive">{errors.maxTokens}</p>
              )}
            </div>
          </div>

          {/* System Prompt Field */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">{systemPromptLabel}</Label>
            <Textarea
              id="systemPrompt"
              value={formData.config.systemPrompt || ''}
              onChange={(e) =>
                handleFieldChange('systemPrompt', e.target.value, true)
              }
              placeholder={systemPromptPlaceholder}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.config.systemPrompt?.length || 0} characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {saving}
                </>
              ) : agent ? (
                update
              ) : (
                create
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
