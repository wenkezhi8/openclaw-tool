'use client';

import { useI18n } from '@/hooks';
import { HeartbeatConfig } from '@/components/heartbeat/HeartbeatConfig';
import { TaskList } from '@/components/heartbeat/TaskList';
import { Heart } from 'lucide-react';

export default function HeartbeatPage() {
  const { t } = useI18n();

  const pageTexts = {
    title: t('heartbeat.title') || 'Heartbeat Tasks',
    description: t('heartbeat.description') || 'Manage scheduled tasks and automated heartbeats',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8" />
            {pageTexts.title}
          </h1>
          <p className="text-muted-foreground">{pageTexts.description}</p>
        </div>
      </div>

      {/* Heartbeat Configuration */}
      <HeartbeatConfig />

      {/* Task List */}
      <TaskList />
    </div>
  );
}
