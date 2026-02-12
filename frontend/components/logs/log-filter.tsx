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
import { Search, Trash2, Download } from 'lucide-react';
import type { LogLevel, LogComponent } from '@/types/log';

interface LogFilterProps {
  search: string;
  level: LogLevel | 'all';
  component: LogComponent | 'all';
  onSearchChange: (value: string) => void;
  onLevelChange: (value: LogLevel | 'all') => void;
  onComponentChange: (value: LogComponent | 'all') => void;
  onClear: () => void;
  onExport?: () => void;
}

export function LogFilter({
  search,
  level,
  component,
  onSearchChange,
  onLevelChange,
  onComponentChange,
  onClear,
  onExport,
}: LogFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={level} onValueChange={onLevelChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          <SelectItem value="debug">Debug</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="warn">Warning</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>
      <Select value={component} onValueChange={onComponentChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All components" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All components</SelectItem>
          <SelectItem value="gateway">Gateway</SelectItem>
          <SelectItem value="agents">Agents</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={onClear}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Clear logs</span>
      </Button>
      {onExport && (
        <Button variant="outline" size="icon" onClick={onExport}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Export logs</span>
        </Button>
      )}
    </div>
  );
}
