'use client';

import { useI18n } from '@/lib/i18n';
import { localeFlags } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
  const { locale, setLocale, availableLocales } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          data-testid="language-selector"
          data-language="true"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden md:inline" data-language-flag="true">{localeFlags[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-language-options="true">
        {availableLocales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="gap-2"
            data-locale={loc}
          >
            <span data-locale-flag={loc}>{localeFlags[loc]}</span>
            <span data-locale-name={loc}>{loc}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
