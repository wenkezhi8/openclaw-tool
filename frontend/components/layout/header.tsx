'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, Github, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from '@/components/i18n/language-selector';
import { useI18n } from '@/lib/i18n';

const navigation = [
  { key: 'dashboard', href: '/' },
  { key: 'install', href: '/install' },
  { key: 'gateway', href: '/gateway' },
  { key: 'agents', href: '/agents' },
  { key: 'channels', href: '/channels' },
  { key: 'models', href: '/models' },
  { key: 'logs', href: '/logs' },
];

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">OpenClaw Manager</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <LanguageSelector />
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">{t('header.settings')}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/openclaw/openclaw-manager"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
