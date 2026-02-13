'use client';

import { useSoulConfig } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Sparkles, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common';

export function SoulConfig() {
  const { data, isLoading, refetch } = useSoulConfig();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">SOUL Configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          No SOUL configuration found. Create a SOUL.md file to define your agent&apos;s personality.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          SOUL Configuration
        </CardTitle>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>

        {data.personality && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personality
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.personality.traits?.map((trait, index) => (
                <Badge key={index} variant="secondary">
                  {trait}
                </Badge>
              ))}
            </div>
            {data.personality.tone && (
              <p className="text-xs text-muted-foreground mt-2">
                Tone: {data.personality.tone}
              </p>
            )}
          </div>
        )}

        {data.capabilities && data.capabilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {data.capabilities.map((cap, index) => (
                <Badge key={index} variant="outline">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.behaviorGuidelines && data.behaviorGuidelines.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Behavior Guidelines
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {data.behaviorGuidelines.map((guideline, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">-</span>
                  {guideline}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.systemPrompt && (
          <div>
            <h4 className="text-sm font-medium mb-2">System Prompt</h4>
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md whitespace-pre-wrap line-clamp-6">
              {data.systemPrompt}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
