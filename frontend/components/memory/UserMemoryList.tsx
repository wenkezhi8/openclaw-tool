'use client';

import { useState } from 'react';
import { useUserMemory, useMemoryActions, useSearchMemory } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import type { UserMemoryType } from '@/types/memory';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

const typeColors: Record<UserMemoryType, string> = {
  preference: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  fact: 'bg-green-500/10 text-green-500 border-green-500/20',
  context: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function UserMemoryList() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<UserMemoryType | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, refetch } = useUserMemory(page, 10, type);
  const { deleteMemory, isDeleting } = useMemoryActions();
  const searchResult = useSearchMemory(isSearching ? { query: searchQuery, type, limit: 50 } : { query: '' });

  const memories = isSearching ? searchResult.data?.memories : data?.memories;
  const total = isSearching ? searchResult.data?.total : data?.total;
  const loading = isSearching ? searchResult.isLoading : isLoading;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            User Memory ({total || 0})
          </CardTitle>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search memory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
          {isSearching ? (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          ) : (
            <Button onClick={handleSearch}>Search</Button>
          )}
          <Select
            value={type || 'all'}
            onValueChange={(value) => setType(value === 'all' ? undefined : (value as UserMemoryType))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="preference">Preference</SelectItem>
              <SelectItem value="fact">Fact</SelectItem>
              <SelectItem value="context">Context</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : memories && memories.length > 0 ? (
          <>
            <div className="space-y-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={typeColors[memory.type]}>{memory.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(memory.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{memory.content}</p>
                    {memory.metadata?.tags && memory.metadata.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {memory.metadata.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMemory(memory.id)}
                    disabled={isDeleting}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {!isSearching && data && data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {data.page} of {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No memories found</p>
            {isSearching && <p className="text-sm mt-1">Try a different search term</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
