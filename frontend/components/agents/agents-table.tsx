'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { Agent, AgentStatus, AgentType } from '@/types/agent';

interface AgentsTableProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onToggleStatus?: (agent: Agent) => void;
  onBatchDelete?: (agentIds: string[]) => void;
  onBatchToggleStatus?: (agentIds: string[], status: AgentStatus) => void;
  isLoading?: boolean;
  // i18n text props (future translation support)
  texts?: {
    noAgentsFound?: string;
    name?: string;
    type?: string;
    model?: string;
    status?: string;
    created?: string;
    actions?: string;
    selected?: string;
    deleteSelected?: string;
    deleteSelectedDesc?: string;
    activateSelected?: string;
    deactivateSelected?: string;
    edit?: string;
    delete?: string;
    activate?: string;
    deactivate?: string;
    cancel?: string;
    confirm?: string;
  };
}

type BatchAction = 'delete' | 'activate' | 'deactivate' | null;

export function AgentsTable({
  agents,
  onEdit,
  onDelete,
  onToggleStatus,
  onBatchDelete,
  onBatchToggleStatus,
  isLoading = false,
  texts = {},
}: AgentsTableProps) {
  // Ensure agents is always an array (defensive programming)
  const safeAgents = Array.isArray(agents) ? agents : [];

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<BatchAction>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isSomeSelected, setIsSomeSelected] = useState(false);

  const {
    noAgentsFound = 'No agents found. Create your first agent to get started.',
    name = 'Name',
    type = 'Type',
    model = 'Model',
    status = 'Status',
    created = 'Created',
    actions = 'Actions',
    selected = '{count} selected',
    deleteSelected = 'Delete Selected',
    deleteSelectedDesc = 'Are you sure you want to delete {count} agent(s)? This action cannot be undone.',
    activateSelected = 'Activate Selected',
    deactivateSelected = 'Deactivate Selected',
    edit = 'Edit',
    delete: deleteText = 'Delete',
    activate = 'Activate',
    deactivate = 'Deactivate',
    cancel = 'Cancel',
    confirm = 'Confirm',
  } = texts;

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(safeAgents.map((a) => a.id));
      setSelectedIds(allIds);
      setIsAllSelected(true);
      setIsSomeSelected(false);
    } else {
      setSelectedIds(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    setIsAllSelected(newSelected.size === safeAgents.length);
    setIsSomeSelected(newSelected.size > 0 && newSelected.size < safeAgents.length);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
    setIsSomeSelected(false);
  };

  // Batch actions
  const handleBatchAction = () => {
    const ids = Array.from(selectedIds);
    switch (batchAction) {
      case 'delete':
        onBatchDelete?.(ids);
        break;
      case 'activate':
        onBatchToggleStatus?.(ids, 'active');
        break;
      case 'deactivate':
        onBatchToggleStatus?.(ids, 'inactive');
        break;
    }
    clearSelection();
    setBatchAction(null);
  };

  const getStatusColor = (status: AgentStatus) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusIcon = (status: AgentStatus) => {
    return status === 'active' ? (
      <Power className="h-3 w-3" />
    ) : (
      <PowerOff className="h-3 w-3" />
    );
  };

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  return (
    <>
      {/* Batch Action Bar */}
      {hasSelection && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border mb-4 animate-in slide-in-from-top-2">
          <span className="text-sm font-medium">
            {selected.replace('{count}', String(selectedCount))}
          </span>
          <div className="flex gap-2">
            {onBatchToggleStatus && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBatchAction('activate')}
                >
                  <Power className="h-4 w-4 mr-1.5" />
                  {activate}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBatchAction('deactivate')}
                >
                  <PowerOff className="h-4 w-4 mr-1.5" />
                  {deactivate}
                </Button>
              </>
            )}
            {onBatchDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBatchAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {deleteSelected}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  {...(isSomeSelected && { 'data-state': 'indeterminate' })}
                />
              </TableHead>
              <TableHead>{name}</TableHead>
              <TableHead>{type}</TableHead>
              <TableHead>{model}</TableHead>
              <TableHead>{status}</TableHead>
              <TableHead>{created}</TableHead>
              <TableHead className="text-right">{actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {noAgentsFound}
                </TableCell>
              </TableRow>
            ) : (
              safeAgents.map((agent) => {
                const isSelected = selectedIds.has(agent.id);
                return (
                  <TableRow
                    key={agent.id}
                    className={cn(
                      isSelected && "bg-muted/50"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectOne(agent.id, checked as boolean)
                        }
                        aria-label={`Select ${agent.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {agent.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.model}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "gap-1.5",
                          getStatusColor(agent.status)
                        )}
                      >
                        {getStatusIcon(agent.status)}
                        <span className="capitalize">{agent.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(agent)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {edit}
                          </DropdownMenuItem>
                          {onToggleStatus && (
                            <DropdownMenuItem
                              onClick={() => onToggleStatus(agent)}
                            >
                              {agent.status === 'active' ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  {deactivate}
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  {activate}
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(agent)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteText}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Batch Action Confirmation Dialog */}
      <AlertDialog
        open={batchAction !== null}
        onOpenChange={(open) => !open && setBatchAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {batchAction === 'delete' && deleteSelected}
              {batchAction === 'activate' && activateSelected}
              {batchAction === 'deactivate' && deactivateSelected}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteSelectedDesc
                .replace('{count}', String(selectedCount))
                .replace('delete', batchAction === 'delete' ? 'delete' :
                        batchAction === 'activate' ? 'activate' : 'deactivate')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchAction}>
              {confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
