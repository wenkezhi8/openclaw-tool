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
import { MoreHorizontal, Trash2, Settings, Play, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import type { Model } from '@/types/model';
import { cn } from '@/lib/utils';

interface ModelsTableProps {
  models: Model[];
  onToggle: (model: Model) => void;
  onDelete: (model: Model) => void;
  onTest?: (model: Model) => void;
  onConfigure?: (model: Model) => void;
  // Text props for i18n
  text?: {
    noModels?: string;
    name?: string;
    id?: string;
    channel?: string;
    contextLength?: string;
    pricing?: string;
    enabled?: string;
    actions?: string;
    n_a?: string;
    in?: string;
    out?: string;
    delete?: string;
    configure?: string;
    test?: string;
  };
}

export function ModelsTable({
  models,
  onToggle,
  onDelete,
  onTest,
  onConfigure,
  text
}: ModelsTableProps) {
  const t = text;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t?.name || 'Name'}</TableHead>
            <TableHead>{t?.id || 'ID'}</TableHead>
            <TableHead>{t?.channel || 'Channel'}</TableHead>
            <TableHead>{t?.contextLength || 'Context Length'}</TableHead>
            <TableHead>{t?.pricing || 'Pricing (per 1K tokens)'}</TableHead>
            <TableHead>{t?.enabled || 'Enabled'}</TableHead>
            <TableHead className="text-right">{t?.actions || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                {t?.noModels || 'No models found. Models will appear here once channels are configured.'}
              </TableCell>
            </TableRow>
          ) : (
            models.map((model) => (
              <TableRow key={model.id} className={cn(!model.enabled && 'opacity-50')}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {model.name}
                    {model.enabled && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{model.id}</TableCell>
                <TableCell>
                  <Badge variant="outline">{model.channel}</Badge>
                </TableCell>
                <TableCell>
                  {model.contextLength
                    ? model.contextLength.toLocaleString()
                    : (t?.n_a || 'N/A')}
                </TableCell>
                <TableCell>
                  {model.pricing ? (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t?.in || 'In'}:</span> ${model.pricing.input}
                      <span className="mx-1 text-muted-foreground">|</span>
                      <span className="text-muted-foreground">{t?.out || 'Out'}:</span> ${model.pricing.output}
                    </div>
                  ) : (
                    (t?.n_a || 'N/A')
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={model.enabled}
                    onCheckedChange={() => onToggle(model)}
                  />
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
                      {onTest && model.enabled && (
                        <DropdownMenuItem onClick={() => onTest(model)}>
                          <Play className="h-4 w-4 mr-2" />
                          {t?.test || 'Test'}
                        </DropdownMenuItem>
                      )}
                      {onConfigure && (
                        <DropdownMenuItem onClick={() => onConfigure(model)}>
                          <Settings className="h-4 w-4 mr-2" />
                          {t?.configure || 'Configure'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(model)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t?.delete || 'Delete'}
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
