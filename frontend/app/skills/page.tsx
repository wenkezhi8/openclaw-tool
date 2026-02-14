'use client';

import { useState } from 'react';
import { useSkills, useMarketplace, useSkillActions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, Search, Package, Download, Star, Zap } from 'lucide-react';
import { useI18n } from '@/hooks';
import type { Skill, MarketplaceSkill, SkillStatus } from '@/types/skill';
import { LoadingSpinner } from '@/components/common';

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Status badge component
function StatusBadge({ status }: { status: SkillStatus }) {
  const statusStyles: Record<SkillStatus, string> = {
    installed: 'bg-green-500/10 text-green-500 border-green-500/20',
    available: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    updating: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={cn('px-2 py-1 text-xs rounded-full border', statusStyles[status])}>
      {status}
    </span>
  );
}

// Installed Skills Tab Content
function InstalledSkillsTab() {
  const { data, isLoading, refetch } = useSkills();
  const { uninstallSkill, toggleSkill, isUninstalling, isToggling } = useSkillActions();

  const skills = data?.skills || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Installed Skills ({skills.length})</h3>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : skills.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
                <StatusBadge status={skill.status} />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                  <p className="text-xs text-muted-foreground">v{skill.version || '1.0.0'}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSkill({ id: skill.id, enabled: !skill.enabled })}
                      disabled={isToggling}
                    >
                      {skill.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => uninstallSkill(skill.id)}
                      disabled={isUninstalling}
                    >
                      Uninstall
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No skills installed</p>
            <p className="text-sm text-muted-foreground mt-1">Browse the marketplace to install skills</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Marketplace Tab Content
function MarketplaceTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, refetch } = useMarketplace({ query: searchQuery || undefined });
  const { installSkill, isInstalling } = useSkillActions();

  const skills = data?.skills || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : skills.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs">{skill.rating.toFixed(1)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>v{skill.version || '1.0.0'}</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {skill.downloads}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => installSkill({ id: skill.id })}
                    disabled={isInstalling}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No skills found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SkillsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('installed');

  const pageTexts = {
    title: t('skills.title') || 'Skills',
    description: t('skills.description') || 'Manage AI skills and browse the ClawHub marketplace',
    installedTab: t('skills.installed') || 'Installed',
    marketplaceTab: t('skills.marketplace') || 'Marketplace',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTexts.title}</h1>
          <p className="text-muted-foreground">{pageTexts.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="installed">
            <Package className="h-4 w-4 mr-2" />
            {pageTexts.installedTab}
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Zap className="h-4 w-4 mr-2" />
            {pageTexts.marketplaceTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="mt-6">
          <InstalledSkillsTab />
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <MarketplaceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
