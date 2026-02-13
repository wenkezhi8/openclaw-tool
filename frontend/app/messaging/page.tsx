'use client';

import { useState } from 'react';
import { useMessagingChannels, useMessagingChannelActions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, MessageCircle, Send, Hash, MessageSquare } from 'lucide-react';
import { useI18n } from '@/hooks';
import type { MessagingChannel, MessagingProvider, CreateMessagingChannelRequest } from '@/types/messaging-channel';
import { PROVIDER_INFO } from '@/types/messaging-channel';
import { LoadingSpinner } from '@/components/common';

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    connected: 'bg-green-500/10 text-green-500 border-green-500/20',
    disconnected: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    pairing: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={cn('px-2 py-1 text-xs rounded-full border', statusStyles[status] || statusStyles.disconnected)}>
      {status}
    </span>
  );
}

// Provider icon component
function ProviderIcon({ provider }: { provider: MessagingProvider }) {
  const info = PROVIDER_INFO[provider];
  const iconMap: Record<string, React.ReactNode> = {
    telegram: <Send className="h-4 w-4" />,
    discord: <MessageCircle className="h-4 w-4" />,
    slack: <Hash className="h-4 w-4" />,
    whatsapp: <MessageSquare className="h-4 w-4" />,
    wechat: <MessageSquare className="h-4 w-4" />,
  };

  return (
    <span className={cn('flex items-center gap-1', info?.color)}>
      {iconMap[provider] || <MessageCircle className="h-4 w-4" />}
      {info?.name || provider}
    </span>
  );
}

export default function MessagingPage() {
  const { t } = useI18n();
  const { data: channels, isLoading, refetch } = useMessagingChannels();
  const {
    connectMessagingChannel,
    disconnectMessagingChannel,
    isConnecting,
  } = useMessagingChannelActions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (channel: MessagingChannel) => {
    setConnectingId(channel.id);
    try {
      await connectMessagingChannel(channel.id);
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = (channel: MessagingChannel) => {
    disconnectMessagingChannel(channel.id);
  };

  const pageTexts = {
    title: t('messaging.title') || 'Messaging Channels',
    description: t('messaging.description') || 'Manage messaging platform integrations',
    addChannel: t('messaging.addChannel') || 'Add Channel',
    refresh: t('common.refresh'),
    noChannels: t('messaging.noChannels') || 'No messaging channels configured',
    connect: t('messaging.connect') || 'Connect',
    disconnect: t('messaging.disconnect') || 'Disconnect',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTexts.title}</h1>
          <p className="text-muted-foreground">{pageTexts.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            title={pageTexts.refresh}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {pageTexts.addChannel}
          </Button>
        </div>
      </div>

      {/* Channels Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : channels && channels.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <ProviderIcon provider={channel.provider} />
                </CardTitle>
                <StatusBadge status={channel.status} />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold">{channel.name}</p>
                    <p className="text-sm text-muted-foreground">{channel.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {channel.status === 'connected' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(channel)}
                        disabled={isConnecting && connectingId === channel.id}
                      >
                        {pageTexts.disconnect}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(channel)}
                        disabled={isConnecting && connectingId === channel.id}
                      >
                        {pageTexts.connect}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{pageTexts.noChannels}</p>
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {pageTexts.addChannel}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TODO: Add ChannelForm dialog */}
    </div>
  );
}
