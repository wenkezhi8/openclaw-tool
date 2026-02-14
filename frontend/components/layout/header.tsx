'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Activity,
  Github,
  Settings,
  Menu,
  X,
  ExternalLink,
  BarChart3,
  Settings2,
  Bot,
  Wrench,
  Zap,
  Stethoscope,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from '@/components/i18n/language-selector';
import { useI18n } from '@/lib/i18n';
import { useGatewayDashboard } from '@/hooks/use-gateway';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Quick access items (always visible)
const quickAccess = [
  { key: 'gettingStarted', href: '/getting-started', icon: Zap },
  { key: 'diagnostics', href: '/diagnostics', icon: Stethoscope },
];

// Navigation groups
const navGroups = [
  {
    key: 'monitor',
    icon: BarChart3,
    items: [
      { key: 'dashboard', href: '/' },
      { key: 'gateway', href: '/gateway' },
      { key: 'logs', href: '/logs' },
    ],
  },
  {
    key: 'config',
    icon: Settings2,
    items: [
      { key: 'install', href: '/install' },
      { key: 'channels', href: '/channels' },
      { key: 'agents', href: '/agents' },
    ],
  },
  {
    key: 'ai',
    icon: Bot,
    items: [
      { key: 'providers', href: '/providers' },
      { key: 'models', href: '/models' },
      { key: 'persona', href: '/persona' },
    ],
  },
  {
    key: 'tools',
    icon: Wrench,
    items: [
      { key: 'skills', href: '/skills' },
      { key: 'memory', href: '/memory' },
      { key: 'browser', href: '/browser' },
      { key: 'heartbeats', href: '/heartbeats' },
    ],
  },
];

// Helper component for navigation group dropdown
function NavGroupDropdown({
  group,
  pathname,
  t,
}: {
  group: (typeof navGroups)[0];
  pathname: string;
  t: (key: string) => string;
}) {
  const isActive = group.items.some((item) => item.href === pathname);
  const Icon = group.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 px-2 text-sm font-medium transition-colors',
            isActive ? 'text-foreground' : 'text-foreground/60 hover:text-foreground/80'
          )}
        >
          <Icon className="mr-1.5 h-4 w-4" />
          {t(`navGroups.${group.key}`)}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t(`navGroups.${group.key}`)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {group.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className={cn(
                'w-full cursor-pointer',
                pathname === item.href && 'bg-accent'
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              {/* Quick access items */}
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'transition-colors hover:text-foreground/80 px-2 py-1 flex items-center gap-1',
                      pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              })}

              <div className="mx-2 h-4 w-px bg-border" />

              {/* Navigation group dropdowns */}
              {navGroups.map((group) => (
                <NavGroupDropdown key={group.key} group={group} pathname={pathname} t={t} />
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
          <div className="py-4 border-t md:hidden">
            {/* Quick access */}
            <div className="px-4 mb-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {t('navGroups.quickAccess')}
              </p>
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md',
                      pathname === item.href ? 'text-foreground bg-accent' : 'text-foreground/60'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`nav.${item.key}`)}
                  </Link>
                );
              })}
            </div>

            {/* Navigation groups */}
            {navGroups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.key} className="px-4 mb-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {t(`navGroups.${group.key}`)}
                  </p>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md',
                        pathname === item.href ? 'text-foreground bg-accent' : 'text-foreground/60'
                      )}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
                </div>
              );
            })}

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
