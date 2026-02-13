'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  // Wait for client mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to get the actual theme, fallback to theme
  const currentTheme = resolvedTheme || theme;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      data-testid="theme-toggle"
      data-theme-button="true"
      aria-label={t('header.toggleTheme')}
    >
      {mounted && currentTheme === 'dark' ? (
        <Moon className="h-4 w-4" data-theme-icon="moon" />
      ) : (
        <Sun className="h-4 w-4" data-theme-icon="sun" />
      )}
      <span className="sr-only" data-theme-label="true">{t('header.toggleTheme')}</span>
    </Button>
  );
}
