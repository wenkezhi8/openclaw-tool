'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  // i18n text props
  text?: {
    title?: string;
    retry?: string;
  };
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  text
}: ErrorMessageProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 p-6">
        <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">
            {title || text?.title || 'Error'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            {text?.retry || 'Retry'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
