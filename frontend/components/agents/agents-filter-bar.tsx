'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import type { AgentType, AgentStatus } from '@/types/agent';

interface AgentsFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: AgentStatus | 'all';
  onStatusChange: (value: AgentStatus | 'all') => void;
  typeFilter: AgentType | 'all';
  onTypeChange: (value: AgentType | 'all') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  // i18n text props (future translation support)
  texts?: {
    searchPlaceholder?: string;
    statusFilter?: string;
    typeFilter?: string;
    all?: string;
    active?: string;
    inactive?: string;
    clearFilters?: string;
  };
}

export function AgentsFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onClearFilters,
  hasActiveFilters,
  texts = {},
}: AgentsFilterBarProps) {
  const {
    searchPlaceholder = 'Search agents...',
    statusFilter: statusFilterLabel = 'Status',
    typeFilter: typeFilterLabel = 'Type',
    all = 'All',
    active = 'Active',
    inactive = 'Inactive',
    clearFilters = 'Clear Filters',
  } = texts;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute right-1 top-1.5 h-5 w-5"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusChange(value as AgentStatus | 'all')}
          >
            <SelectTrigger className="w-[130px]">
              <Filter className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              <SelectValue placeholder={statusFilterLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{all}</SelectItem>
              <SelectItem value="active">{active}</SelectItem>
              <SelectItem value="inactive">{inactive}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => onTypeChange(value as AgentType | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={typeFilterLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{all}</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="completion">Completion</SelectItem>
              <SelectItem value="embedding">Embedding</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          {clearFilters}
        </Button>
      )}
    </div>
  );
}
