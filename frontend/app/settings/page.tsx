'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks';
import { useI18n } from '@/lib/i18n';
import { HelpButton } from '@/components/common';
import { useGatewayDashboard, useGatewayConfig } from '@/hooks/use-gateway';
import { ExternalLink, Bot, Sparkles, Zap, Globe } from 'lucide-react';

// Model provider configuration
interface ModelProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  getKeyUrl: string;
  color: string;
}

const modelProviders: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: <Bot className="h-8 w-8" />,
    getKeyUrl: 'https://platform.openai.com/api-keys',
    color: 'text-green-500',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: <Sparkles className="h-8 w-8" />,
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    color: 'text-orange-500',
  },
  {
    id: 'glm',
    name: 'GLM',
    icon: <Zap className="h-8 w-8" />,
    getKeyUrl: 'https://open.bigmodel.cn/api-keys',
    color: 'text-blue-500',
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: <Globe className="h-8 w-8" />,
    getKeyUrl: 'https://aistudio.google.com/apikey',
    color: 'text-red-500',
  },
];

export default function SettingsPage() {
  const { t } = useI18n();
  const { success, error } = useToast();

  // OpenClaw Gateway configuration state
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGatewayDashboard();
  const { updateConfig, isUpdating, updateSuccess, updateError, reset: resetConfig } = useGatewayConfig();

  const [port, setPort] = useState<number>(18789);
  const [token, setToken] = useState<string>('');
  const [restartAfterSave, setRestartAfterSave] = useState(true);

  // Model provider configuration state
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);
  const [providerApiKeys, setProviderApiKeys] = useState<Record<string, string>>({});
  const [testLoading, setTestLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Update form when data is loaded
  useEffect(() => {
    if (dashboardData) {
      setPort(dashboardData.port || 18789);
      setToken(dashboardData.token || '');
    }
  }, [dashboardData]);

  // Handle update success
  useEffect(() => {
    if (updateSuccess) {
      success(t('settings.openclawConfig.saveSuccess'));
      resetConfig();
    }
  }, [updateSuccess, success, t, resetConfig]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      error(t('settings.openclawConfig.saveError'));
    }
  }, [updateError, error, t]);

  const [apiConfigLoading, setApiConfigLoading] = useState(false);
  const [gatewayConfigLoading, setGatewayConfigLoading] = useState(false);

  const handleSaveApiConfig = async () => {
    setApiConfigLoading(true);
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 800));
      success(t('messages.saveSuccess'));
    } catch (err) {
      error(t('messages.saveError'));
    } finally {
      setApiConfigLoading(false);
    }
  };

  const handleSaveGatewayConfig = async () => {
    setGatewayConfigLoading(true);
    try {
      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 800));
      success(t('messages.saveSuccess'));
    } catch (err) {
      error(t('messages.saveError'));
    } finally {
      setGatewayConfigLoading(false);
    }
  };

  const handleSaveOpenClawConfig = () => {
    updateConfig({
      port,
      token: token || undefined,
      restart: restartAfterSave,
    });
  };

  // Model provider handlers
  const handleOpenConfigDialog = (provider: ModelProvider) => {
    setSelectedProvider(provider);
    setConfigDialogOpen(true);
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;
    setTestLoading(true);
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const apiKey = providerApiKeys[selectedProvider.id] || '';
    if (apiKey.length > 10) {
      success(t('settings.modelProviders.testSuccess'));
    } else {
      error(t('settings.modelProviders.testError'));
    }
    setTestLoading(false);
  };

  const handleSaveApiKey = async () => {
    if (!selectedProvider) return;
    setSaveLoading(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success(t('settings.modelProviders.saveSuccess'));
    setSaveLoading(false);
    setConfigDialogOpen(false);
  };

  const isProviderConfigured = (providerId: string) => {
    return !!providerApiKeys[providerId];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <HelpButton page="settings" />
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Model Provider Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.modelProviders.title')}</CardTitle>
            <CardDescription>
              {t('settings.modelProviders.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {modelProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={provider.color}>
                      {provider.icon}
                    </div>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {isProviderConfigured(provider.id) ? (
                          <Badge variant="default" className="text-xs">
                            {t('settings.modelProviders.configured')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {t('settings.modelProviders.notConfigured')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenConfigDialog(provider)}
                  >
                    {t('common.configure')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OpenClaw Gateway Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.openclawConfig.title')}</CardTitle>
            <CardDescription>
              {t('settings.openclawConfig.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDashboard ? (
              <div className="text-muted-foreground">{t('common.loading')}</div>
            ) : !dashboardData ? (
              <div className="text-muted-foreground">{t('settings.openclawConfig.notConfigured')}</div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="openclaw-port">{t('settings.openclawConfig.port')}</Label>
                  <Input
                    id="openclaw-port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value) || 18789)}
                    placeholder="18789"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="openclaw-token">{t('settings.openclawConfig.token')}</Label>
                  <Input
                    id="openclaw-token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={t('settings.openclawConfig.tokenPlaceholder')}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restart-after-save"
                    checked={restartAfterSave}
                    onCheckedChange={(checked) => setRestartAfterSave(checked as boolean)}
                  />
                  <Label htmlFor="restart-after-save" className="cursor-pointer">
                    {t('settings.openclawConfig.restartAfterSave')}
                  </Label>
                </div>
                <Button
                  onClick={handleSaveOpenClawConfig}
                  disabled={isUpdating}
                >
                  {isUpdating ? t('settings.openclawConfig.saving') : t('settings.openclawConfig.save')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.apiConfig.title')}</CardTitle>
            <CardDescription>
              {t('settings.apiConfig.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="api-url">{t('settings.apiConfig.apiUrl')}</Label>
              <Input
                id="api-url"
                defaultValue="http://localhost:3001/api"
                placeholder="http://localhost:3001/api"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-url">{t('settings.apiConfig.wsUrl')}</Label>
              <Input
                id="ws-url"
                defaultValue="ws://localhost:3001/ws"
                placeholder="ws://localhost:3001/ws"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api-key">{t('settings.apiConfig.apiKey')}</Label>
              <Input
                id="api-key"
                type="password"
                placeholder={t('settings.apiConfig.apiKeyPlaceholder')}
              />
            </div>
            <Button onClick={handleSaveApiConfig} disabled={apiConfigLoading}>
              {apiConfigLoading ? t('common.loading') : t('settings.apiConfig.save')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.gatewayConfig.title')}</CardTitle>
            <CardDescription>
              {t('settings.gatewayConfig.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="default-port">{t('settings.gatewayConfig.defaultPort')}</Label>
              <Input
                id="default-port"
                type="number"
                defaultValue="8000"
                placeholder="8000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-workers">{t('settings.gatewayConfig.defaultWorkers')}</Label>
              <Input
                id="default-workers"
                type="number"
                defaultValue="4"
                placeholder="4"
              />
            </div>
            <Button onClick={handleSaveGatewayConfig} variant="outline" disabled={gatewayConfigLoading}>
              {gatewayConfigLoading ? t('common.loading') : t('settings.gatewayConfig.save')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.about.title')}</CardTitle>
            <CardDescription>
              {t('settings.about.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.about.version')}</span>
              <span>1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.about.license')}</span>
              <span>MIT</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.about.repository')}</span>
              <a
                href="https://github.com/wenkezhi8/openclaw-tool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/wenkezhi8/openclaw-tool
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Provider Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider && (
                <>
                  <span className={selectedProvider.color}>{selectedProvider.icon}</span>
                  {selectedProvider.name} {t('settings.modelProviders.configTitle')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {t('settings.modelProviders.configDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <a
                href={selectedProvider?.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t('settings.modelProviders.getKey')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api-key-input">{t('settings.modelProviders.apiKey')}</Label>
              <Input
                id="api-key-input"
                type="password"
                placeholder={t('settings.modelProviders.apiKeyPlaceholder')}
                value={selectedProvider ? (providerApiKeys[selectedProvider.id] || '') : ''}
                onChange={(e) => {
                  if (selectedProvider) {
                    setProviderApiKeys((prev) => ({
                      ...prev,
                      [selectedProvider.id]: e.target.value,
                    }));
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testLoading}
            >
              {testLoading ? t('common.loading') : t('common.test')}
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={saveLoading}
            >
              {saveLoading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
