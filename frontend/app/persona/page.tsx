'use client';

import { useState } from 'react';
import { useI18n } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Star,
  Check
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';

interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for personas
const mockPersonas: Persona[] = [
  {
    id: '1',
    name: 'AI Assistant',
    description: 'A helpful general-purpose AI assistant',
    systemPrompt: 'You are a helpful, harmless, and honest AI assistant. You provide clear and accurate information to help users with their questions and tasks.',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Translator',
    description: 'Professional multilingual translator',
    systemPrompt: 'You are a professional translator. You accurately translate text between different languages while preserving the original meaning, tone, and context. You also explain cultural nuances when relevant.',
    isActive: false,
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
    name: 'Coding Assistant',
    description: 'Expert programming helper',
    systemPrompt: 'You are an expert programming assistant. You help users write, debug, and optimize code. You explain programming concepts clearly and provide best practices. You are proficient in multiple programming languages and frameworks.',
    isActive: false,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    id: '4',
    name: 'Creative Writer',
    description: 'Imaginative storyteller and content creator',
    systemPrompt: 'You are a creative writing assistant. You help users craft engaging stories, articles, and creative content. You have a vivid imagination and can adapt to various writing styles and genres.',
    isActive: false,
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
  },
  {
    id: '5',
    name: 'Data Analyst',
    description: 'Expert in data analysis and visualization',
    systemPrompt: 'You are a data analysis expert. You help users analyze datasets, create visualizations, and derive insights from data. You are proficient in statistics, data manipulation, and can explain complex analytical concepts in simple terms.',
    isActive: false,
    createdAt: '2024-01-19T16:20:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
  },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export default function PersonaPage() {
  const { t } = useI18n();
  const [personas, setPersonas] = useState<Persona[]>(mockPersonas);
  const [isLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
  });

  const pageTexts = {
    title: t('persona.title') || 'Persona Management',
    pageDescription: t('persona.pageDescription') || 'Manage AI personality settings and system prompts',
    addPersona: t('persona.addPersona') || 'Add Persona',
    editPersona: t('persona.editPersona') || 'Edit Persona',
    name: t('persona.name') || 'Name',
    namePlaceholder: t('persona.namePlaceholder') || 'Enter persona name',
    personaDescription: t('persona.personaDescription') || 'Description',
    descriptionPlaceholder: t('persona.descriptionPlaceholder') || 'Brief description of this persona',
    systemPrompt: t('persona.systemPrompt') || 'System Prompt',
    systemPromptPlaceholder: t('persona.systemPromptPlaceholder') || 'Enter the system prompt that defines this persona',
    active: t('persona.active') || 'Active',
    inactive: t('persona.inactive') || 'Inactive',
    activate: t('persona.activate') || 'Activate',
    deactivate: t('persona.deactivate') || 'Deactivate',
    noPersonas: t('persona.noPersonas') || 'No personas configured',
    noPersonasDesc: t('persona.noPersonasDesc') || 'Create a persona to get started',
    cancel: t('common.cancel') || 'Cancel',
    save: t('common.save') || 'Save',
    delete: t('common.delete') || 'Delete',
    edit: t('common.edit') || 'Edit',
    lastUpdated: t('persona.lastUpdated') || 'Last updated',
  };

  const handleOpenDialog = (persona?: Persona) => {
    if (persona) {
      setEditingPersona(persona);
      setFormData({
        name: persona.name,
        description: persona.description,
        systemPrompt: persona.systemPrompt,
      });
    } else {
      setEditingPersona(null);
      setFormData({
        name: '',
        description: '',
        systemPrompt: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPersona(null);
    setFormData({
      name: '',
      description: '',
      systemPrompt: '',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editingPersona) {
      // Update existing persona
      setPersonas((prev) =>
        prev.map((p) =>
          p.id === editingPersona.id
            ? {
                ...p,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      toast.success('Persona updated successfully');
    } else {
      // Create new persona
      const newPersona: Persona = {
        id: Date.now().toString(),
        ...formData,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPersonas((prev) => [...prev, newPersona]);
      toast.success('Persona created successfully');
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    const persona = personas.find((p) => p.id === id);
    if (persona?.isActive) {
      toast.error('Cannot delete active persona');
      return;
    }
    setPersonas((prev) => prev.filter((p) => p.id !== id));
    toast.success('Persona deleted successfully');
  };

  const handleToggleActive = (id: string) => {
    setPersonas((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === id ? !p.isActive : false,
      }))
    );
    const persona = personas.find((p) => p.id === id);
    if (persona?.isActive) {
      toast.success('Persona deactivated');
    } else {
      toast.success('Persona activated');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-8 w-8" />
            {pageTexts.title}
          </h1>
          <p className="text-muted-foreground">{pageTexts.pageDescription}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {pageTexts.addPersona}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPersona ? pageTexts.editPersona : pageTexts.addPersona}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">{pageTexts.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={pageTexts.namePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{pageTexts.personaDescription}</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={pageTexts.descriptionPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">{pageTexts.systemPrompt}</Label>
                <Textarea
                  id="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      systemPrompt: e.target.value,
                    }))
                  }
                  placeholder={pageTexts.systemPromptPlaceholder}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  {pageTexts.cancel}
                </Button>
                <Button onClick={handleSave} disabled={!formData.name.trim()}>
                  {pageTexts.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Persona List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center py-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      ) : personas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className={`relative ${persona.isActive ? 'ring-2 ring-primary' : ''}`}
            >
              {persona.isActive && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {persona.name}
                  </CardTitle>
                  <Badge
                    variant={persona.isActive ? 'default' : 'secondary'}
                    className={
                      persona.isActive
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : ''
                    }
                  >
                    {persona.isActive ? pageTexts.active : pageTexts.inactive}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {persona.description}
                </p>
                <div className="bg-muted/50 rounded p-2 max-h-24 overflow-hidden">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {persona.systemPrompt}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pageTexts.lastUpdated}: {formatDate(persona.updatedAt)}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant={persona.isActive ? 'secondary' : 'default'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleActive(persona.id)}
                  >
                    {persona.isActive ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {pageTexts.active}
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-1" />
                        {pageTexts.activate}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(persona)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(persona.id)}
                    disabled={persona.isActive}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{pageTexts.noPersonas}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {pageTexts.noPersonasDesc}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
