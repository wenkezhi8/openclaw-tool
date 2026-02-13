'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks';
import { useI18n } from '@/lib/i18n';
import { useGatewayDashboard, useGatewayConfig } from '@/hooks/use-gateway';

export default function SettingsPage() {
  const { t } = useI18n();
  const { success, error } = useToast();

  // OpenClaw Gateway configuration state
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGatewayDashboard();
  const { updateConfig, isUpdating, updateSuccess, updateError, reset: resetConfig } = useGatewayConfig();

  const [port, setPort] = useState<number>(18789);
  const [token, setToken] = useState<string>('');
  const [restartAfterSave, setRestartAfterSave] = useState(true);

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

  const handleSaveApiConfig = () => {
    success(t('messages.saveSuccess'));
  };

  const handleSaveGatewayConfig = () => {
    success(t('messages.saveSuccess'));
  };

  const handleSaveOpenClawConfig = () => {
    updateConfig({
      port,
      token: token || undefined,
      restart: restartAfterSave,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
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
            <Button onClick={handleSaveApiConfig}>{t('settings.apiConfig.save')}</Button>
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
            <Button onClick={handleSaveGatewayConfig} variant="outline">{t('settings.gatewayConfig.save')}</Button>
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
    </div>
  );
}
