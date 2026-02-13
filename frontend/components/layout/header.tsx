'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, Github, Settings, Menu, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from '@/components/i18n/language-selector';
import { useI18n } from '@/lib/i18n';
import { useGatewayDashboard } from '@/hooks/use-gateway';
import { useState } from 'react';

const navigation = [
  { key: 'dashboard', href: '/' },
  { key: 'gettingStarted', href: '/getting-started' },
  { key: 'diagnostics', href: '/diagnostics' },
  { key: 'install', href: '/install' },
  { key: 'gateway', href: '/gateway' },
  { key: 'agents', href: '/agents' },
  { key: 'channels', href: '/channels' },
  { key: 'models', href: '/models' },
  { key: 'browser', href: '/browser' },
  { key: 'logs', href: '/logs' },
];

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: dashboardData } = useGatewayDashboard();

  const dashboardUrl = dashboardData?.dashboardUrl;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center">
          <div className="mr-2 flex flex-1 items-center">
            <Link href="/" className="mr-4 flex items-center space-x-2">
              <Activity className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">OpenClaw Tool</span>
            </Link>
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-foreground/80 px-2 py-1',
                    pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            <LanguageSelector />
            <ThemeToggle />
            {dashboardUrl && (
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">{t('nav.openclaw') || 'OpenClaw'}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">{t('header.settings')}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <a
                href="https://github.com/wenkezhi8/openclaw-tool"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="py-4 space-y-1 border-t md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent',
                  pathname === item.href ? 'text-foreground bg-accent' : 'text-foreground/60'
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="px-4 pt-2 space-y-1">
              {dashboardUrl && (
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent text-foreground/60"
                >
                  {t('nav.openclaw') || 'OpenClaw'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent text-foreground/60"
              >
                {t('header.settings')}
              </Link>
              <a
                href="https://github.com/wenkezhi8/openclaw-tool"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent text-foreground/60"
              >
                GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
