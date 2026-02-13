'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks';
import { useI18n } from '@/lib/i18n';

export default function SettingsPage() {
  const { t } = useI18n();
  const { success, error } = useToast();

  const handleSave = () => {
    success(t('settings.saveSuccess'));
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
            <Button onClick={handleSave}>{t('settings.apiConfig.save')}</Button>
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
            <Button onClick={handleSave} variant="outline">{t('settings.gatewayConfig.save')}</Button>
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
                href="https://github.com/openclaw/openclaw-tool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/openclaw/openclaw-tool
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
