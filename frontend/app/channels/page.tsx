'use client';

import { useState } from 'react';
import { useChannels, useChannelActions } from '@/hooks';
import { ChannelsTable, ChannelForm, TestConnectionDialog } from '@/components/channels';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Channel, CreateChannelRequest, UpdateChannelRequest } from '@/types/channel';
import { useI18n } from '@/hooks';

export default function ChannelsPage() {
  const { t } = useI18n();

  const { data: channels, isLoading } = useChannels();
  const {
    createChannel,
    updateChannel,
    deleteChannel,
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting
  } = useChannelActions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | undefined>();
  const [testingChannel, setTestingChannel] = useState<Channel | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const handleCreate = (formData: CreateChannelRequest) => {
    createChannel(formData, {
      onSuccess: () => {
        setIsFormOpen(false);
        toast.success(t('messages.createSuccess'));
      },
    });
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setIsFormOpen(true);
  };

  const handleUpdate = (formData: CreateChannelRequest) => {
    if (editingChannel) {
      const updateData: UpdateChannelRequest = {
        name: formData.name,
        enabled: formData.enabled,
        priority: formData.priority,
        config: formData.config,
      };
      updateChannel(
        { id: editingChannel.id, data: updateData },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingChannel(undefined);
            toast.success(t('messages.updateSuccess'));
          },
        }
      );
    }
  };

  const handleDelete = (channel: Channel) => {
    if (confirm(`${t('messages.confirmDelete')} "${channel.name}"?`)) {
      deleteChannel(channel.id);
      toast.success(t('messages.deleteSuccess'));
    }
  };

  const handleToggle = (channel: Channel) => {
    updateChannel({
      id: channel.id,
      data: { enabled: !channel.enabled },
    });
  };

  const handleTestConnection = async (channel: Channel) => {
    setTestingChannel(channel);
    setIsTestDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingChannel(undefined);
  };

  const pageTexts = {
    title: t('channels.title'),
    description: t('channels.list'),
    addChannel: t('channels.create'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTexts.title}</h1>
          <p className="text-muted-foreground">
            {pageTexts.description}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {pageTexts.addChannel}
        </Button>
      </div>

      <ChannelsTable
        channels={channels || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onTestConnection={handleTestConnection}
      />

      <ChannelForm
        channel={editingChannel}
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingChannel ? handleUpdate : handleCreate}
        isLoading={isCreating || isUpdating || isDeleting}
      />

      <TestConnectionDialog
        channel={testingChannel}
        open={isTestDialogOpen}
        onClose={() => {
          setIsTestDialogOpen(false);
          setTestingChannel(null);
        }}
        onTest={async (channel) => {
          const result = await testConnection({ id: channel.id });
          setIsTestDialogOpen(false);
          setTestingChannel(null);
          return result;
        }}
      />
    </div>
  );
}
