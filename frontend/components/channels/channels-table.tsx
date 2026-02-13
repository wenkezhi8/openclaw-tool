'use client';

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
import { MoreHorizontal, Pencil, Trash2, Power, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import type { Channel, ConnectionStatus } from '@/types/channel';
import { cn } from '@/lib/utils';

interface ChannelsTableProps {
  channels: Channel[];
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
  onToggle: (channel: Channel) => void;
  onTestConnection?: (channel: Channel) => void;
  // Text props for i18n
  text?: {
    noChannels?: string;
    name?: string;
    type?: string;
    priority?: string;
    status?: string;
    enabled?: string;
    created?: string;
    actions?: string;
    edit?: string;
    delete?: string;
    testConnection?: string;
    connected?: string;
    disconnected?: string;
    checking?: string;
    error?: string;
  };
}

export function ChannelsTable({
  channels,
  onEdit,
  onDelete,
  onToggle,
  onTestConnection,
  text
}: ChannelsTableProps) {
  // Ensure channels is always an array (defensive programming)
  const safeChannels = Array.isArray(channels) ? channels : [];
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      openai: 'bg-green-500 hover:bg-green-600',
      anthropic: 'bg-orange-500 hover:bg-orange-600',
      azure: 'bg-blue-500 hover:bg-blue-600',
      custom: 'bg-purple-500 hover:bg-purple-600',
    };
    return colors[type] || 'bg-gray-500 hover:bg-gray-600';
  };

  const getStatusIcon = (status?: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status?: ConnectionStatus) => {
    const statusColors: Record<ConnectionStatus, string> = {
      connected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      checking: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusText = {
      connected: text?.connected || 'Connected',
      disconnected: text?.disconnected || 'Disconnected',
      checking: text?.checking || 'Checking...',
      error: text?.error || 'Error',
    };

    return (
      <Badge variant="outline" className={cn(statusColors[status || 'disconnected'])}>
        <div className="flex items-center gap-1.5">
          {getStatusIcon(status)}
          <span className="text-xs">{statusText[status || 'disconnected']}</span>
        </div>
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{text?.name || 'Name'}</TableHead>
            <TableHead>{text?.type || 'Type'}</TableHead>
            <TableHead>{text?.status || 'Status'}</TableHead>
            <TableHead>{text?.priority || 'Priority'}</TableHead>
            <TableHead>{text?.enabled || 'Enabled'}</TableHead>
            <TableHead>{text?.created || 'Created'}</TableHead>
            <TableHead className="text-right">{text?.actions || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeChannels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                {text?.noChannels || 'No channels found. Add a channel to connect to AI providers.'}
              </TableCell>
            </TableRow>
          ) : (
            safeChannels.map((channel) => (
              <TableRow key={channel.id}>
                <TableCell className="font-medium">{channel.name}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(channel.type)}>
                    {channel.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(channel.status)}
                </TableCell>
                <TableCell>{channel.priority}</TableCell>
                <TableCell>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => onToggle(channel)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(channel.createdAt).toLocaleDateString()}
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
                      {onTestConnection && channel.enabled && (
                        <DropdownMenuItem onClick={() => onTestConnection(channel)}>
                          <Power className="h-4 w-4 mr-2" />
                          {text?.testConnection || 'Test Connection'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(channel)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {text?.edit || 'Edit'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(channel)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {text?.delete || 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
