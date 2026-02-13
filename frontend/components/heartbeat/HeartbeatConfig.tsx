'use client';

import { useHeartbeatConfig, useHeartbeatActions } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Heart, Play, RefreshCw, Clock, Settings } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { useState } from 'react';

function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}

export function HeartbeatConfig() {
  const { data, isLoading, refetch } = useHeartbeatConfig();
  const { updateConfig, triggerHeartbeat, isUpdatingConfig, isTriggering } = useHeartbeatActions();

  const [localConfig, setLocalConfig] = useState({
    enabled: true,
    interval: 30,
    autoExecute: true,
  });

  // Sync local state with server data
  useState(() => {
    if (data) {
      setLocalConfig({
        enabled: data.enabled,
        interval: data.interval,
        autoExecute: data.autoExecute,
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load heartbeat configuration
        </CardContent>
      </Card>
    );
  }

  const handleToggle = (field: keyof typeof localConfig, value: boolean) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
    updateConfig({ [field]: value });
  };

  const handleIntervalChange = (value: number) => {
    setLocalConfig((prev) => ({ ...prev, interval: value }));
  };

  const handleSaveInterval = () => {
    updateConfig({ interval: localConfig.interval });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Heartbeat Configuration
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => triggerHeartbeat()}
            disabled={isTriggering}
          >
            <Play className="h-4 w-4 mr-2" />
            {isTriggering ? 'Triggering...' : 'Trigger Now'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">
                {data.enabled ? (
                  <span className="text-green-500">Active</span>
                ) : (
                  <span className="text-muted-foreground">Paused</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Interval</p>
              <p className="text-sm font-medium">{data.interval} minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Run</p>
              <p className="text-sm font-medium">{formatDate(data.lastHeartbeat)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Next Run</p>
              <p className="text-sm font-medium">{formatDate(data.nextHeartbeat)}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-medium">Settings</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Heartbeat</Label>
              <p className="text-xs text-muted-foreground">
                Automatically run scheduled tasks
              </p>
            </div>
            <Switch
              id="enabled"
              checked={data.enabled}
              onCheckedChange={(checked) => handleToggle('enabled', checked)}
              disabled={isUpdatingConfig}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoExecute">Auto Execute</Label>
              <p className="text-xs text-muted-foreground">
                Execute tasks automatically when heartbeat triggers
              </p>
            </div>
            <Switch
              id="autoExecute"
              checked={data.autoExecute}
              onCheckedChange={(checked) => handleToggle('autoExecute', checked)}
              disabled={isUpdatingConfig}
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="interval">Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                min={1}
                max={1440}
                value={localConfig.interval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10) || 30)}
                disabled={isUpdatingConfig}
              />
            </div>
            <Button onClick={handleSaveInterval} disabled={isUpdatingConfig}>
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
