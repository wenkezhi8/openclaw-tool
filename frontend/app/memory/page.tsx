'use client';

import { useI18n } from '@/hooks';
import { MemoryStatus } from '@/components/memory/MemoryStatus';
import { SoulConfig } from '@/components/memory/SoulConfig';
import { UserMemoryList } from '@/components/memory/UserMemoryList';
import { Brain } from 'lucide-react';

export default function MemoryPage() {
  const { t } = useI18n();

  const pageTexts = {
    title: t('memory.title') || 'Memory System',
    description: t('memory.description') || 'Manage agent memory, SOUL configuration, and user memories',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            {pageTexts.title}
          </h1>
          <p className="text-muted-foreground">{pageTexts.description}</p>
        </div>
      </div>

      {/* Memory Status */}
      <MemoryStatus />

      {/* SOUL Configuration */}
      <SoulConfig />

      {/* User Memory List */}
      <UserMemoryList />
    </div>
  );
}
