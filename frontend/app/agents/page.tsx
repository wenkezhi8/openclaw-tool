'use client';

import { useState, useMemo } from 'react';
import { useAgents, useAgentActions } from '@/hooks';
import { AgentsTable, AgentForm, AgentsFilterBar } from '@/components/agents';
import { HelpButton } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import type { Agent, AgentDetail, CreateAgentRequest, AgentType, AgentStatus } from '@/types/agent';
import { useI18n } from '@/hooks';

export default function AgentsPage() {
  const { t } = useI18n();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AgentType | 'all'>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();

  // Data fetching with filters
  const { data, isLoading, refetch } = useAgents({
    search: searchQuery || undefined,
    status: statusFilter,
    type: typeFilter,
  });

  const {
    createAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
    batchDeleteAgents,
    batchUpdateStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingStatus,
    isBatchDeleting,
    isBatchUpdating,
  } = useAgentActions();

  const agents = data?.agents || [];

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all';
  }, [searchQuery, statusFilter, typeFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // CRUD handlers
  const handleCreate = (formData: CreateAgentRequest) => {
    createAgent(formData, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setIsFormOpen(true);
  };

  const handleUpdate = (formData: CreateAgentRequest) => {
    if (editingAgent) {
      updateAgent(
        { id: editingAgent.id, data: formData },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingAgent(undefined);
          },
        }
      );
    }
  };

  const handleDelete = (agent: Agent) => {
    deleteAgent(agent.id);
  };

  const handleToggleStatus = (agent: Agent) => {
    const newStatus: AgentStatus = agent.status === 'active' ? 'inactive' : 'active';
    toggleAgentStatus({ agent, status: newStatus });
  };

  // Batch operation handlers
  const handleBatchDelete = (agentIds: string[]) => {
    batchDeleteAgents(agentIds);
  };

  const handleBatchToggleStatus = (agentIds: string[], status: AgentStatus) => {
    batchUpdateStatus({ ids: agentIds, status });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAgent(undefined);
  };

  const pageTexts = {
    title: t('agents.title'),
    description: t('agents.list'),
    newAgent: t('agents.create'),
    refresh: t('common.refresh'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTexts.title}</h1>
          <p className="text-muted-foreground">{pageTexts.description}</p>
        </div>
        <div className="flex gap-2">
          <HelpButton page="agents" />
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
            {pageTexts.newAgent}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <AgentsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Table */}
      <AgentsTable
        agents={agents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onBatchDelete={handleBatchDelete}
        onBatchToggleStatus={handleBatchToggleStatus}
        isLoading={isLoading}
      />

      {/* Form Dialog */}
      <AgentForm
        agent={editingAgent}
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingAgent ? handleUpdate : handleCreate}
        isLoading={isCreating || isUpdating || isDeleting || isTogglingStatus || isBatchDeleting || isBatchUpdating}
        initialConfig={(editingAgent as AgentDetail | undefined)?.config}
      />
    </div>
  );
}

// Helper function to conditionally apply className
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
