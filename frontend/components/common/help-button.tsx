'use client';

import { useState } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useHelpContent, type HelpPageKey } from '@/lib/help-content';

interface HelpButtonProps {
  page: HelpPageKey;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
}

export function HelpButton({
  page,
  className,
  variant = 'ghost',
  size = 'icon',
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const helpContent = useHelpContent(page);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={cn('text-muted-foreground hover:text-foreground', className)}
        title="Help"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">Help</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {helpContent.title}
            </DialogTitle>
            <DialogDescription>
              {helpContent.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {helpContent.sections.map((section, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{section.title}</span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expandedSection === index && 'rotate-90'
                      )}
                    />
                  </button>
                  {expandedSection === index && (
                    <div className="px-4 pb-4 pt-0">
                      <ul className="space-y-2">
                        {section.content.map((content, contentIndex) => (
                          <li
                            key={contentIndex}
                            className="text-sm text-muted-foreground flex gap-2"
                          >
                            <span className="text-primary mt-1">
                              {contentIndex + 1}.
                            </span>
                            <span>{content}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
