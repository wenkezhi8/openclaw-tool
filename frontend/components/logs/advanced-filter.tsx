'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { LogLevel, LogComponent } from '@/types/log';
import { useI18n } from '@/hooks';

interface AdvancedFilterProps {
  search: string;
  level: LogLevel | 'all';
  component: LogComponent | 'all';
  onSearchChange: (value: string) => void;
  onLevelChange: (value: LogLevel | 'all') => void;
  onComponentChange: (value: LogComponent | 'all') => void;
  onAdvancedFiltersChange: (filters: {
    useRegex: boolean;
    caseSensitive: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

export function AdvancedFilter({
  search,
  level,
  component,
  onSearchChange,
  onLevelChange,
  onComponentChange,
  onAdvancedFiltersChange,
}: AdvancedFilterProps) {
  const { t } = useI18n();
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleClearAll = () => {
    onSearchChange('');
    onLevelChange('all');
    onComponentChange('all');
    setUseRegex(false);
    setCaseSensitive(false);
    setDateFrom('');
    setDateTo('');
    onAdvancedFiltersChange({ useRegex: false, caseSensitive: false });
  };

  const applyAdvancedFilters = () => {
    onAdvancedFiltersChange({
      useRegex,
      caseSensitive,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    setIsAdvancedOpen(false);
  };

  const hasActiveFilters =
    search || level !== 'all' || component !== 'all' || useRegex || caseSensitive || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('logs.search') || 'Search logs...'}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={level} onValueChange={onLevelChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('logs.levels.all') || 'All levels'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('logs.levels.all') || 'All levels'}</SelectItem>
            <SelectItem value="debug">{t('logs.levels.debug') || 'Debug'}</SelectItem>
            <SelectItem value="info">{t('logs.levels.info') || 'Info'}</SelectItem>
            <SelectItem value="warn">{t('logs.levels.warn') || 'Warning'}</SelectItem>
            <SelectItem value="error">{t('logs.levels.error') || 'Error'}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={component} onValueChange={onComponentChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('logs.components.all') || 'All components'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('logs.components.all') || 'All components'}</SelectItem>
            <SelectItem value="gateway">{t('logs.components.gateway') || 'Gateway'}</SelectItem>
            <SelectItem value="agents">{t('logs.components.agents') || 'Agents'}</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('logs.advancedSearch.title') || 'Advanced Search'}</DialogTitle>
              <DialogDescription>
                Configure advanced search options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="regex"
                  checked={useRegex}
                  onCheckedChange={(checked) => setUseRegex(checked as boolean)}
                />
                <Label htmlFor="regex">{t('logs.advancedSearch.regex') || 'Use Regular Expressions'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="caseSensitive"
                  checked={caseSensitive}
                  onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
                />
                <Label htmlFor="caseSensitive">{t('logs.advancedSearch.caseSensitive') || 'Case Sensitive'}</Label>
              </div>
              <div className="space-y-2">
                <Label>{t('logs.advancedSearch.dateRange') || 'Date Range'}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                      {t('logs.advancedSearch.from') || 'From'}
                    </Label>
                    <Input
                      id="dateFrom"
                      type="datetime-local"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                      {t('logs.advancedSearch.to') || 'To'}
                    </Label>
                    <Input
                      id="dateTo"
                      type="datetime-local"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdvancedOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyAdvancedFilters}>Apply</Button>
            </div>
          </DialogContent>
        </Dialog>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
