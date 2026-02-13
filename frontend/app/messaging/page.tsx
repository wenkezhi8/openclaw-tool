'use client';

import { useState } from 'react';
import { useMessagingChannels, useMessagingChannelActions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, MessageCircle, Send, Hash, MessageSquare, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { HelpButton } from '@/components/common';
import { useI18n } from '@/hooks';
import type { MessagingChannel, MessagingProvider } from '@/types/messaging-channel';
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

// Tutorial step component
function TutorialStep({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
        {number}
      </span>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

// Tutorial content component
function TutorialContent({ provider, t }: { provider: MessagingProvider; t: (key: string) => string | undefined }) {
  if (provider === 'telegram') {
    return (
      <div className="space-y-3 pt-2">
        <TutorialStep number={1}>
          {t('messaging.tutorial.telegram.step1') || 'Open Telegram and search for @BotFather'}
        </TutorialStep>
        <TutorialStep number={2}>
          {t('messaging.tutorial.telegram.step2') || 'Send /newbot to create a new bot'}
        </TutorialStep>
        <TutorialStep number={3}>
          {t('messaging.tutorial.telegram.step3') || 'Follow the prompts to set the bot name'}
        </TutorialStep>
        <TutorialStep number={4}>
          {t('messaging.tutorial.telegram.step4') || 'Copy the Token you received'}
        </TutorialStep>
        <TutorialStep number={5}>
          {t('messaging.tutorial.telegram.step5') || 'Paste the Token into the input field below'}
        </TutorialStep>
      </div>
    );
  }

  if (provider === 'discord') {
    return (
      <div className="space-y-3 pt-2">
        <TutorialStep number={1}>
          {t('messaging.tutorial.discord.step1') || 'Visit the Discord Developer Portal'}
        </TutorialStep>
        <TutorialStep number={2}>
          {t('messaging.tutorial.discord.step2') || 'Create a new application'}
        </TutorialStep>
        <TutorialStep number={3}>
          {t('messaging.tutorial.discord.step3') || 'Add a Bot to your application'}
        </TutorialStep>
        <TutorialStep number={4}>
          {t('messaging.tutorial.discord.step4') || 'Copy the Bot Token'}
        </TutorialStep>
        <TutorialStep number={5}>
          {t('messaging.tutorial.discord.step5') || 'Invite the Bot to your server'}
        </TutorialStep>
      </div>
    );
  }

  // Default tutorial for other providers
  return (
    <div className="space-y-3 pt-2">
      <TutorialStep number={1}>
        {t('messaging.tutorial.default.step1') || 'Visit the platform developer portal'}
      </TutorialStep>
      <TutorialStep number={2}>
        {t('messaging.tutorial.default.step2') || 'Create a new application or bot'}
      </TutorialStep>
      <TutorialStep number={3}>
        {t('messaging.tutorial.default.step3') || 'Configure the required permissions'}
      </TutorialStep>
      <TutorialStep number={4}>
        {t('messaging.tutorial.default.step4') || 'Copy the access credentials'}
      </TutorialStep>
      <TutorialStep number={5}>
        {t('messaging.tutorial.default.step5') || 'Enter the credentials in the connection form'}
      </TutorialStep>
    </div>
  );
}

// Channel card with tutorial
function ChannelCard({
  channel,
  onConnect,
  onDisconnect,
  isConnecting,
  connectingId,
  pageTexts,
}: {
  channel: MessagingChannel;
  onConnect: (channel: MessagingChannel) => void;
  onDisconnect: (channel: MessagingChannel) => void;
  isConnecting: boolean;
  connectingId: string | null;
  pageTexts: Record<string, string>;
}) {
  const { t } = useI18n();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <Card>
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

          {/* Tutorial section */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setIsTutorialOpen(!isTutorialOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t('messaging.tutorial.title') || 'Connection Tutorial'}
              </span>
              {isTutorialOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isTutorialOpen && (
              <div className="px-3 py-3 border-t bg-muted/30">
                <TutorialContent provider={channel.provider} t={t} />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {channel.status === 'connected' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDisconnect(channel)}
                disabled={isConnecting && connectingId === channel.id}
              >
                {pageTexts.disconnect}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onConnect(channel)}
                disabled={isConnecting && connectingId === channel.id}
              >
                {pageTexts.connect}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
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
          <HelpButton page="messaging" />
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
            <ChannelCard
              key={channel.id}
              channel={channel}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnecting={isConnecting}
              connectingId={connectingId}
              pageTexts={pageTexts}
            />
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
